// @JSOL v0.2.95 - Self-Hosted Engine Orchestrator
const $mResolveWrappers = function($mTargetsConfig, $sCliTargetFlag, $sCliPrefixOverride, $sCliSuffixOverride) {
  let $sPrefix = "";
    let $sSuffix = "";
    if ($sCliPrefixOverride.length > 0 || $sCliSuffixOverride.length > 0) {
    return JSOL.dict("prefix",  $sCliPrefixOverride,  "suffix",  $sCliSuffixOverride);
  }
  if ($sCliTargetFlag.length > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$sCliTargetFlag] !== null) {
      const $mTargetObj = $mTargetsConfig["targets"][$sCliTargetFlag];
            return JSOL.dict("prefix",  $mTargetObj["prefix"],  "suffix",  $mTargetObj["suffix"]);
    }
  }
  const $sDefaultPointer = $mTargetsConfig["default"];
    if ($sDefaultPointer !== null && $sDefaultPointer.length > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$sDefaultPointer] !== null) {
      const $mDefaultObj = $mTargetsConfig["targets"][$sDefaultPointer];
            return JSOL.dict("prefix",  $mDefaultObj["prefix"],  "suffix",  $mDefaultObj["suffix"]);
    }
  }
  return JSOL.dict("prefix",  "",  "suffix",  "");
};
const $mExecuteCompilationPipeline = function($sSourceCode, $mTargetsConfig, $mCliOptions, $mSSOT) {
  const $mPragmaResult = $mAuditPragma($sSourceCode);
    if ($mPragmaResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mPragmaResult["errors"]);
  }
  const $mMaskedData = $mMaskSourceCode($sSourceCode);
    const $sMaskedCode = $mMaskedData["maskedCode"];
    const $aTokens = $mMaskedData["tokens"];

    const $mPatternResult = $mAuditForbiddenPatterns($sMaskedCode);
    if ($mPatternResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mPatternResult["errors"]);
  }
  const $mTypingResult = $mAuditStrictTyping($sMaskedCode, $mSSOT);
    if ($mTypingResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mTypingResult["errors"]);
  }
  const $sJsTargetFlag = $mCliOptions["jsTarget"];
    const $sJsPrefixArg = $mCliOptions["jsPrefix"];
    const $sJsSuffixArg = $mCliOptions["jsSuffix"];
    const $mJsWrappers = $mResolveWrappers($mTargetsConfig["js"], $sJsTargetFlag, $sJsPrefixArg, $sJsSuffixArg);

    const $sPhpTargetFlag = $mCliOptions["phpTarget"];
    const $sPhpPrefixArg = $mCliOptions["phpPrefix"];
    const $sPhpSuffixArg = $mCliOptions["phpSuffix"];
    const $mPhpWrappers = $mResolveWrappers($mTargetsConfig["php"], $sPhpTargetFlag, $sPhpPrefixArg, $sPhpSuffixArg);

    const $sTsTargetFlag = $mCliOptions["tsTarget"];
    const $sTsPrefixArg = $mCliOptions["tsPrefix"];
    const $sTsSuffixArg = $mCliOptions["tsSuffix"];
    const $mTsWrappers = $mResolveWrappers($mTargetsConfig["ts"], $sTsTargetFlag, $sTsPrefixArg, $sTsSuffixArg);

    const $sCompiledJS = $sCompileToJS($sMaskedCode, $mJsWrappers["prefix"], $mJsWrappers["suffix"], $mSSOT["targets"]["js"]);
    const $sCompiledPHP = $sCompileToPHP($sMaskedCode, $mPhpWrappers["prefix"], $mPhpWrappers["suffix"], $mSSOT["targets"]["php"]);

    const $sCompiledTS = $sCompileToJS($sMaskedCode, $mTsWrappers["prefix"], $mTsWrappers["suffix"], $mSSOT["targets"]["ts"]);

    const $sPyTargetFlag = $mCliOptions["pyTarget"];
    const $sPyPrefixArg = $mCliOptions["pyPrefix"];
    const $sPySuffixArg = $mCliOptions["pySuffix"];
    const $mPyWrappers = $mResolveWrappers($mTargetsConfig["py"], $sPyTargetFlag, $sPyPrefixArg, $sPySuffixArg);
    const $sCompiledPY = $sCompileToJS($sMaskedCode, $mPyWrappers["prefix"], $mPyWrappers["suffix"], $mSSOT["targets"]["python"]);

    const $sIndentedJS = $sIndentCode($sCompiledJS, "  ");
    const $sIndentedPHP = $sIndentCode($sCompiledPHP, "  ");
    const $sIndentedTS = $sIndentCode($sCompiledTS, "  ");

    const $sTernaryPY = $sConvertTernaries($sCompiledPY);
    const $sControlFlowPY = $sConvertControlFlowToPython($sTernaryPY);
    const $sSanitizedPY = $sSanitizePythonIdentifiers($sControlFlowPY);
    const $sIndentedPY = $sIndentCode($sSanitizedPY, "  ");
    const $sStrippedPY = $sStripPythonBraces($sIndentedPY, "  ");

    const $aTranslatedTokensPY = $aTranslateCommentTokensToPython($aTokens);

    const $sFinalJS = $sUnmaskSourceCode($sIndentedJS, $aTokens);
    const $sFinalPHP = $sUnmaskSourceCode($sIndentedPHP, $aTokens);
    const $sFinalTS = $sUnmaskSourceCode($sIndentedTS, $aTokens);
    const $sFinalPY = $sUnmaskSourceCode($sStrippedPY, $aTranslatedTokensPY);

    return JSOL.dict(
        "success",  true, 
        "js",  $sFinalJS, 
        "php",  $sFinalPHP, 
        "ts",  $sFinalTS, 
        "py",  $sFinalPY
    );
};
