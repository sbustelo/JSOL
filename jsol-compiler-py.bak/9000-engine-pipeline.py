import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - Self-Hosted Engine Orchestrator

def mResolveWrappers(mTargetsConfig, saCliTargetFlag, saCliPrefixOverride, saCliSuffixOverride): 

  if len(saCliPrefixOverride) > 0 or len(saCliSuffixOverride) > 0: 

    return JSOL.dict("prefix",  saCliPrefixOverride,  "suffix",  saCliSuffixOverride);


  if len(saCliTargetFlag) > 0: 

    if mTargetsConfig["targets"] != None and mTargetsConfig["targets"][saCliTargetFlag] != None: 

      mTargetObj = mTargetsConfig["targets"][saCliTargetFlag];
      return JSOL.dict("prefix",  mTargetObj["prefix"],  "suffix",  mTargetObj["suffix"]);




  saDefaultPointer = mTargetsConfig["default"];
  if saDefaultPointer != None and len(saDefaultPointer) > 0: 

    if mTargetsConfig["targets"] != None and mTargetsConfig["targets"][saDefaultPointer] != None: 

      mDefaultObj = mTargetsConfig["targets"][saDefaultPointer];
      return JSOL.dict("prefix",  mDefaultObj["prefix"],  "suffix",  mDefaultObj["suffix"]);




  return JSOL.dict("prefix",  "",  "suffix",  "");


def fCompileBackendJS(saMaskedCode, saPrefix, saSuffix, mSSOTRules, aTokens): 

  saCompiled = sCompileToJS(saMaskedCode, saPrefix, saSuffix, mSSOTRules);
  saIndented = saIndentCode(saCompiled, "  ");
  return JSOL.dict("code",  saIndented,  "tokens",  aTokens);


def fCompileBackendPHP(saMaskedCode, saPrefix, saSuffix, mSSOTRules, aTokens): 

  saCompiled = sCompileToPHP(saMaskedCode, saPrefix, saSuffix, mSSOTRules);
  saIndented = saIndentCode(saCompiled, "  ");
  return JSOL.dict("code",  saIndented,  "tokens",  aTokens);


def fCompileBackendTS(saMaskedCode, saPrefix, saSuffix, mSSOTRules, aTokens): 

  saCompiled = sCompileToJS(saMaskedCode, saPrefix, saSuffix, mSSOTRules);
  saIndented = saIndentCode(saCompiled, "  ");
  return JSOL.dict("code",  saIndented,  "tokens",  aTokens);


def fCompileBackendPython(saMaskedCode, saPrefix, saSuffix, mSSOTRules, aTokens): 

  saCompiled = sCompileToJS(saMaskedCode, saPrefix, saSuffix, mSSOTRules);
  saControlFlow = saConvertControlFlowToPython(saCompiled);
  saTernary = saConvertTernaries(saControlFlow);
  saSanitized = saSanitizePythonIdentifiers(saTernary);
  saIndented = saIndentCode(saSanitized, "  ");
  saStripped = saStripPythonBraces(saIndented, "  ");
  aPyTokens = aTranslateCommentTokensToPython(aTokens);
  return JSOL.dict("code",  saStripped,  "tokens",  aPyTokens);


mBackendRegistry = JSOL.dict(
"js",  fCompileBackendJS, 
"php",  fCompileBackendPHP, 
"ts",  fCompileBackendTS, 
"python",  fCompileBackendPython
);

def mExecuteCompilationPipeline(saSourceCode, mTargetsConfig, mCliOptions, mSSOT): 

  mPragmaResult = mAuditPragma(saSourceCode);
  if mPragmaResult["valid"] == False: 

    return JSOL.dict("success",  False,  "errors",  mPragmaResult["errors"]);


  mMaskedData = mMaskSourceCode(saSourceCode);
  saMaskedCode = mMaskedData["maskedCode"];
  aTokens = mMaskedData["tokens"];

  mPatternResult = mAuditForbiddenPatterns(saMaskedCode);
  if mPatternResult["valid"] == False: 

    return JSOL.dict("success",  False,  "errors",  mPatternResult["errors"]);


  mTypingResult = mAuditStrictTyping(saMaskedCode, mSSOT);
  if mTypingResult["valid"] == False: 

    return JSOL.dict("success",  False,  "errors",  mTypingResult["errors"]);


  aTargetIds = list(mBackendRegistry.keys());
  mResults = JSOL.dict();

  i = 0;
  while i < len(aTargetIds): 

    saTargetId = aTargetIds[i];
    fBackend = mBackendRegistry[saTargetId];

    saTargetFlag = "";
    if ( saTargetId + "" + "Target" in mCliOptions) == True: 

      saTargetFlag = mCliOptions[saTargetId + "" + "Target"];


    elif ( "target" in mCliOptions) == True: 

      saTargetFlag = mCliOptions["target"];


    saPrefixArg = "";
    if ( saTargetId + "" + "Prefix" in mCliOptions) == True: 

      saPrefixArg = mCliOptions[saTargetId + "" + "Prefix"];


    saSuffixArg = "";
    if ( saTargetId + "" + "Suffix" in mCliOptions) == True: 

      saSuffixArg = mCliOptions[saTargetId + "" + "Suffix"];


    mWrapperConfig = mTargetsConfig[saTargetId];
    mWrappers = mResolveWrappers(mWrapperConfig, saTargetFlag, saPrefixArg, saSuffixArg);
    mSSOTRules = mSSOT["targets"][saTargetId];

    mBackendResult = fBackend(saMaskedCode, mWrappers["prefix"], mWrappers["suffix"], mSSOTRules, aTokens);
    saFinal = saUnmaskSourceCode(mBackendResult["code"], mBackendResult["tokens"]);

    mResults[saTargetId] = saFinal;

    i = i + 1;


  return JSOL.dict(
  "success",  True, 
  "js",  mResults["js"], 
  "php",  mResults["php"], 
  "ts",  mResults["ts"], 
  "py",  mResults["python"]
  );


