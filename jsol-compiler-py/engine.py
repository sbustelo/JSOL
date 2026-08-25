import math
from jsol_core import JSOL

# @JSOL v0.2.96 - Self-Hosted Engine Orchestrator (generic, target-agnostic)
#
# $mExecuteCompilationPipeline no conoce ningún target por nombre. Itera
# sobre $mBackendRegistry, que mapea target id -> función de compilación
# completa para ese target (masked code, prefix, suffix, reglas SSOT,
# tokens -> { code, tokens }). Sumar un target nuevo: un $fCompileBackendX
# nuevo + una línea en el registro. Este archivo no se vuelve a tocar.

def mResolveWrappers(mTargetsConfig, sCliTargetFlag, sCliPrefixOverride, sCliSuffixOverride): 

  if len(sCliPrefixOverride) > 0 or len(sCliSuffixOverride) > 0: 

    return JSOL.dict("prefix",  sCliPrefixOverride,  "suffix",  sCliSuffixOverride);


  if len(sCliTargetFlag) > 0: 

    if mTargetsConfig["targets"] != None and mTargetsConfig["targets"][sCliTargetFlag] != None: 

      mTargetObj = mTargetsConfig["targets"][sCliTargetFlag];
      return JSOL.dict("prefix",  mTargetObj["prefix"],  "suffix",  mTargetObj["suffix"]);




  sDefaultPointer = mTargetsConfig["default"];
  if sDefaultPointer != None and len(sDefaultPointer) > 0: 

    if mTargetsConfig["targets"] != None and mTargetsConfig["targets"][sDefaultPointer] != None: 

      mDefaultObj = mTargetsConfig["targets"][sDefaultPointer];
      return JSOL.dict("prefix",  mDefaultObj["prefix"],  "suffix",  mDefaultObj["suffix"]);




  return JSOL.dict("prefix",  "",  "suffix",  "");


# --- Backend registry: one function per target, uniform signature ---
# ($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) -> { code, tokens }
# "tokens" is returned (not just "code") because a target may need its own
# transformed token set before unmasking — Python does, to translate "//"
# comments to "#" without ever touching real string literals elsewhere.

def fCompileBackendJS(sMaskedCode, sPrefix, sSuffix, mSSOTRules, aTokens): 

  sCompiled = sCompileToJS(sMaskedCode, sPrefix, sSuffix, mSSOTRules);
  sIndented = sIndentCode(sCompiled, "  ");
  return JSOL.dict("code",  sIndented,  "tokens",  aTokens);


def fCompileBackendPHP(sMaskedCode, sPrefix, sSuffix, mSSOTRules, aTokens): 

  sCompiled = sCompileToPHP(sMaskedCode, sPrefix, sSuffix, mSSOTRules);
  sIndented = sIndentCode(sCompiled, "  ");
  return JSOL.dict("code",  sIndented,  "tokens",  aTokens);


def fCompileBackendTS(sMaskedCode, sPrefix, sSuffix, mSSOTRules, aTokens): 

  sCompiled = sCompileToJS(sMaskedCode, sPrefix, sSuffix, mSSOTRules);
  sIndented = sIndentCode(sCompiled, "  ");
  return JSOL.dict("code",  sIndented,  "tokens",  aTokens);


def fCompileBackendPython(sMaskedCode, sPrefix, sSuffix, mSSOTRules, aTokens): 

  sCompiled = sCompileToJS(sMaskedCode, sPrefix, sSuffix, mSSOTRules);
  sTernary = sConvertTernaries(sCompiled);
  sControlFlow = sConvertControlFlowToPython(sTernary);
  sSanitized = sSanitizePythonIdentifiers(sControlFlow);
  sIndented = sIndentCode(sSanitized, "  ");
  sStripped = sStripPythonBraces(sIndented, "  ");
  aPyTokens = aTranslateCommentTokensToPython(aTokens);
  return JSOL.dict("code",  sStripped,  "tokens",  aPyTokens);


mBackendRegistry = JSOL.dict(
"js",  fCompileBackendJS, 
"php",  fCompileBackendPHP, 
"ts",  fCompileBackendTS, 
"python",  fCompileBackendPython
);

def mExecuteCompilationPipeline(sSourceCode, mTargetsConfig, mCliOptions, mSSOT): 

  mPragmaResult = mAuditPragma(sSourceCode);
  if mPragmaResult["valid"] == False: 

    return JSOL.dict("success",  False,  "errors",  mPragmaResult["errors"]);


  mMaskedData = mMaskSourceCode(sSourceCode);
  sMaskedCode = mMaskedData["maskedCode"];
  aTokens = mMaskedData["tokens"];

  mPatternResult = mAuditForbiddenPatterns(sMaskedCode);
  if mPatternResult["valid"] == False: 

    return JSOL.dict("success",  False,  "errors",  mPatternResult["errors"]);


  mTypingResult = mAuditStrictTyping(sMaskedCode, mSSOT);
  if mTypingResult["valid"] == False: 

    return JSOL.dict("success",  False,  "errors",  mTypingResult["errors"]);


  aTargetIds = list(mBackendRegistry.keys());
  mResults = JSOL.dict();

  i = 0;
  while i < len(aTargetIds): 

    sTargetId = aTargetIds[i];
    fBackend = mBackendRegistry[sTargetId];

    sTargetFlag = "";
    if ( sTargetId + "" + "Target" in mCliOptions) == True: 

      sTargetFlag = mCliOptions[sTargetId + "" + "Target"];


    elif ( "target" in mCliOptions) == True: 

      sTargetFlag = mCliOptions["target"];


    sPrefixArg = "";
    if ( sTargetId + "" + "Prefix" in mCliOptions) == True: 

      sPrefixArg = mCliOptions[sTargetId + "" + "Prefix"];


    sSuffixArg = "";
    if ( sTargetId + "" + "Suffix" in mCliOptions) == True: 

      sSuffixArg = mCliOptions[sTargetId + "" + "Suffix"];


    mWrapperConfig = mTargetsConfig[sTargetId];
    mWrappers = mResolveWrappers(mWrapperConfig, sTargetFlag, sPrefixArg, sSuffixArg);
    mSSOTRules = mSSOT["targets"][sTargetId];

    mBackendResult = fBackend(sMaskedCode, mWrappers["prefix"], mWrappers["suffix"], mSSOTRules, aTokens);
    sFinal = sUnmaskSourceCode(mBackendResult["code"], mBackendResult["tokens"]);

    mResults[sTargetId] = sFinal;

    i = i + 1;


  return JSOL.dict(
  "success",  True, 
  "js",  mResults["js"], 
  "php",  mResults["php"], 
  "ts",  mResults["ts"], 
  "py",  mResults["python"]
  );


