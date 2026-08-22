import math
from jsol_core import JSOL

# @JSOL v0.2.95 - Self-Hosted Engine Orchestrator
def _mResolveWrappers(_mTargetsConfig, _sCliTargetFlag, _sCliPrefixOverride, _sCliSuffixOverride): 

  _sPrefix = "";
  _sSuffix = "";
  if len(_sCliPrefixOverride) > 0 or len(_sCliSuffixOverride) > 0: 

    return JSOL.dict("prefix",  _sCliPrefixOverride,  "suffix",  _sCliSuffixOverride);


  if len(_sCliTargetFlag) > 0: 

    if _mTargetsConfig["targets"] != None and _mTargetsConfig["targets"][_sCliTargetFlag] != None: 

      _mTargetObj = _mTargetsConfig["targets"][_sCliTargetFlag];
      return JSOL.dict("prefix",  _mTargetObj["prefix"],  "suffix",  _mTargetObj["suffix"]);




  _sDefaultPointer = _mTargetsConfig["default"];
  if _sDefaultPointer != None and len(_sDefaultPointer) > 0: 

    if _mTargetsConfig["targets"] != None and _mTargetsConfig["targets"][_sDefaultPointer] != None: 

      _mDefaultObj = _mTargetsConfig["targets"][_sDefaultPointer];
      return JSOL.dict("prefix",  _mDefaultObj["prefix"],  "suffix",  _mDefaultObj["suffix"]);




  return JSOL.dict("prefix",  "",  "suffix",  "");


def _mExecuteCompilationPipeline(_sSourceCode, _mTargetsConfig, _mCliOptions, _mSSOT): 

  _mPragmaResult = _mAuditPragma(_sSourceCode);
  if _mPragmaResult["valid"] == False: 

    return JSOL.dict("success",  False,  "errors",  _mPragmaResult["errors"]);


  _mMaskedData = _mMaskSourceCode(_sSourceCode);
  _sMaskedCode = _mMaskedData["maskedCode"];
  _aTokens = _mMaskedData["tokens"];

  _mPatternResult = _mAuditForbiddenPatterns(_sMaskedCode);
  if _mPatternResult["valid"] == False: 

    return JSOL.dict("success",  False,  "errors",  _mPatternResult["errors"]);


  _mTypingResult = _mAuditStrictTyping(_sMaskedCode, _mSSOT);
  if _mTypingResult["valid"] == False: 

    return JSOL.dict("success",  False,  "errors",  _mTypingResult["errors"]);


  _sJsTargetFlag = "";
  if ( "jsTarget" in _mCliOptions) == True: 

    _sJsTargetFlag = _mCliOptions["jsTarget"];


  _sJsPrefixArg = "";
  if ( "jsPrefix" in _mCliOptions) == True: 

    _sJsPrefixArg = _mCliOptions["jsPrefix"];


  _sJsSuffixArg = "";
  if ( "jsSuffix" in _mCliOptions) == True: 

    _sJsSuffixArg = _mCliOptions["jsSuffix"];


  _mJsWrappers = _mResolveWrappers(_mTargetsConfig["js"], _sJsTargetFlag, _sJsPrefixArg, _sJsSuffixArg);

  _sPhpTargetFlag = "";
  if ( "phpTarget" in _mCliOptions) == True: 

    _sPhpTargetFlag = _mCliOptions["phpTarget"];


  _sPhpPrefixArg = "";
  if ( "phpPrefix" in _mCliOptions) == True: 

    _sPhpPrefixArg = _mCliOptions["phpPrefix"];


  _sPhpSuffixArg = "";
  if ( "phpSuffix" in _mCliOptions) == True: 

    _sPhpSuffixArg = _mCliOptions["phpSuffix"];


  _mPhpWrappers = _mResolveWrappers(_mTargetsConfig["php"], _sPhpTargetFlag, _sPhpPrefixArg, _sPhpSuffixArg);

  _sTsTargetFlag = "";
  if ( "tsTarget" in _mCliOptions) == True: 

    _sTsTargetFlag = _mCliOptions["tsTarget"];


  _sTsPrefixArg = "";
  if ( "tsPrefix" in _mCliOptions) == True: 

    _sTsPrefixArg = _mCliOptions["tsPrefix"];


  _sTsSuffixArg = "";
  if ( "tsSuffix" in _mCliOptions) == True: 

    _sTsSuffixArg = _mCliOptions["tsSuffix"];


  _mTsWrappers = _mResolveWrappers(_mTargetsConfig["ts"], _sTsTargetFlag, _sTsPrefixArg, _sTsSuffixArg);

  _sCompiledJS = _sCompileToJS(_sMaskedCode, _mJsWrappers["prefix"], _mJsWrappers["suffix"], _mSSOT["targets"]["js"]);
  _sCompiledPHP = _sCompileToPHP(_sMaskedCode, _mPhpWrappers["prefix"], _mPhpWrappers["suffix"], _mSSOT["targets"]["php"]);

  _sCompiledTS = _sCompileToJS(_sMaskedCode, _mTsWrappers["prefix"], _mTsWrappers["suffix"], _mSSOT["targets"]["ts"]);

  _sPyTargetFlag = "";
  if ( "pyTarget" in _mCliOptions) == True: 

    _sPyTargetFlag = _mCliOptions["pyTarget"];


  _sPyPrefixArg = "";
  if ( "pyPrefix" in _mCliOptions) == True: 

    _sPyPrefixArg = _mCliOptions["pyPrefix"];


  _sPySuffixArg = "";
  if ( "pySuffix" in _mCliOptions) == True: 

    _sPySuffixArg = _mCliOptions["pySuffix"];


  _mPyWrappers = _mResolveWrappers(_mTargetsConfig["py"], _sPyTargetFlag, _sPyPrefixArg, _sPySuffixArg);
  _sCompiledPY = _sCompileToJS(_sMaskedCode, _mPyWrappers["prefix"], _mPyWrappers["suffix"], _mSSOT["targets"]["python"]);

  _sIndentedJS = _sIndentCode(_sCompiledJS, "  ");
  _sIndentedPHP = _sIndentCode(_sCompiledPHP, "  ");
  _sIndentedTS = _sIndentCode(_sCompiledTS, "  ");

  _sTernaryPY = _sConvertTernaries(_sCompiledPY);
  _sControlFlowPY = _sConvertControlFlowToPython(_sTernaryPY);
  _sSanitizedPY = _sSanitizePythonIdentifiers(_sControlFlowPY);
  _sIndentedPY = _sIndentCode(_sSanitizedPY, "  ");
  _sStrippedPY = _sStripPythonBraces(_sIndentedPY, "  ");

  _aTranslatedTokensPY = _aTranslateCommentTokensToPython(_aTokens);

  _sFinalJS = _sUnmaskSourceCode(_sIndentedJS, _aTokens);
  _sFinalPHP = _sUnmaskSourceCode(_sIndentedPHP, _aTokens);
  _sFinalTS = _sUnmaskSourceCode(_sIndentedTS, _aTokens);
  _sFinalPY = _sUnmaskSourceCode(_sStrippedPY, _aTranslatedTokensPY);

  return JSOL.dict(
  "success",  True, 
  "js",  _sFinalJS, 
  "php",  _sFinalPHP, 
  "ts",  _sFinalTS, 
  "py",  _sFinalPY
  );


