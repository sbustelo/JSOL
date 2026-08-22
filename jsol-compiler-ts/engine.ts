declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.95 - Self-Hosted Engine Orchestrator
const $mResolveWrappers = function($mTargetsConfig: any, $sCliTargetFlag: any, $sCliPrefixOverride: any, $sCliSuffixOverride: any): Record<string, any> {
  let $sPrefix: string = "";
    let $sSuffix: string = "";
    if ($sCliPrefixOverride.length > 0 || $sCliSuffixOverride.length > 0) {
    return JSOL.dict("prefix",  $sCliPrefixOverride,  "suffix",  $sCliSuffixOverride);
  }
  if ($sCliTargetFlag.length > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$sCliTargetFlag] !== null) {
      const $mTargetObj: Record<string, any> = $mTargetsConfig["targets"][$sCliTargetFlag];
            return JSOL.dict("prefix",  $mTargetObj["prefix"],  "suffix",  $mTargetObj["suffix"]);
    }
  }
  const $sDefaultPointer: string = $mTargetsConfig["default"];
    if ($sDefaultPointer !== null && $sDefaultPointer.length > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$sDefaultPointer] !== null) {
      const $mDefaultObj: Record<string, any> = $mTargetsConfig["targets"][$sDefaultPointer];
            return JSOL.dict("prefix",  $mDefaultObj["prefix"],  "suffix",  $mDefaultObj["suffix"]);
    }
  }
  return JSOL.dict("prefix",  "",  "suffix",  "");
};
const $mExecuteCompilationPipeline = function($sSourceCode: any, $mTargetsConfig: any, $mCliOptions: any, $mSSOT: any): Record<string, any> {
  const $mPragmaResult: Record<string, any> = $mAuditPragma($sSourceCode);
    if ($mPragmaResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mPragmaResult["errors"]);
  }
  const $mMaskedData: Record<string, any> = $mMaskSourceCode($sSourceCode);
    const $sMaskedCode: string = $mMaskedData["maskedCode"];
    const $aTokens: any[] = $mMaskedData["tokens"];

    const $mPatternResult: Record<string, any> = $mAuditForbiddenPatterns($sMaskedCode);
    if ($mPatternResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mPatternResult["errors"]);
  }
  const $mTypingResult: Record<string, any> = $mAuditStrictTyping($sMaskedCode, $mSSOT);
    if ($mTypingResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mTypingResult["errors"]);
  }
  let $sJsTargetFlag: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "jsTarget") === true) {
    $sJsTargetFlag = $mCliOptions["jsTarget"];
  }
  let $sJsPrefixArg: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "jsPrefix") === true) {
    $sJsPrefixArg = $mCliOptions["jsPrefix"];
  }
  let $sJsSuffixArg: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "jsSuffix") === true) {
    $sJsSuffixArg = $mCliOptions["jsSuffix"];
  }
  const $mJsWrappers: Record<string, any> = $mResolveWrappers($mTargetsConfig["js"], $sJsTargetFlag, $sJsPrefixArg, $sJsSuffixArg);

    let $sPhpTargetFlag: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "phpTarget") === true) {
    $sPhpTargetFlag = $mCliOptions["phpTarget"];
  }
  let $sPhpPrefixArg: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "phpPrefix") === true) {
    $sPhpPrefixArg = $mCliOptions["phpPrefix"];
  }
  let $sPhpSuffixArg: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "phpSuffix") === true) {
    $sPhpSuffixArg = $mCliOptions["phpSuffix"];
  }
  const $mPhpWrappers: Record<string, any> = $mResolveWrappers($mTargetsConfig["php"], $sPhpTargetFlag, $sPhpPrefixArg, $sPhpSuffixArg);

    let $sTsTargetFlag: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "tsTarget") === true) {
    $sTsTargetFlag = $mCliOptions["tsTarget"];
  }
  let $sTsPrefixArg: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "tsPrefix") === true) {
    $sTsPrefixArg = $mCliOptions["tsPrefix"];
  }
  let $sTsSuffixArg: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "tsSuffix") === true) {
    $sTsSuffixArg = $mCliOptions["tsSuffix"];
  }
  const $mTsWrappers: Record<string, any> = $mResolveWrappers($mTargetsConfig["ts"], $sTsTargetFlag, $sTsPrefixArg, $sTsSuffixArg);

    const $sCompiledJS: string = $sCompileToJS($sMaskedCode, $mJsWrappers["prefix"], $mJsWrappers["suffix"], $mSSOT["targets"]["js"]);
    const $sCompiledPHP: string = $sCompileToPHP($sMaskedCode, $mPhpWrappers["prefix"], $mPhpWrappers["suffix"], $mSSOT["targets"]["php"]);

    const $sCompiledTS: string = $sCompileToJS($sMaskedCode, $mTsWrappers["prefix"], $mTsWrappers["suffix"], $mSSOT["targets"]["ts"]);

    let $sPyTargetFlag: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "pyTarget") === true) {
    $sPyTargetFlag = $mCliOptions["pyTarget"];
  }
  let $sPyPrefixArg: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "pyPrefix") === true) {
    $sPyPrefixArg = $mCliOptions["pyPrefix"];
  }
  let $sPySuffixArg: string = "";
    if (Object.prototype.hasOwnProperty.call($mCliOptions,  "pySuffix") === true) {
    $sPySuffixArg = $mCliOptions["pySuffix"];
  }
  const $mPyWrappers: Record<string, any> = $mResolveWrappers($mTargetsConfig["py"], $sPyTargetFlag, $sPyPrefixArg, $sPySuffixArg);
    const $sCompiledPY: string = $sCompileToJS($sMaskedCode, $mPyWrappers["prefix"], $mPyWrappers["suffix"], $mSSOT["targets"]["python"]);

    const $sIndentedJS: string = $sIndentCode($sCompiledJS, "  ");
    const $sIndentedPHP: string = $sIndentCode($sCompiledPHP, "  ");
    const $sIndentedTS: string = $sIndentCode($sCompiledTS, "  ");

    const $sTernaryPY: string = $sConvertTernaries($sCompiledPY);
    const $sControlFlowPY: string = $sConvertControlFlowToPython($sTernaryPY);
    const $sSanitizedPY: string = $sSanitizePythonIdentifiers($sControlFlowPY);
    const $sIndentedPY: string = $sIndentCode($sSanitizedPY, "  ");
    const $sStrippedPY: string = $sStripPythonBraces($sIndentedPY, "  ");

    const $aTranslatedTokensPY: any[] = $aTranslateCommentTokensToPython($aTokens);

    const $sFinalJS: string = $sUnmaskSourceCode($sIndentedJS, $aTokens);
    const $sFinalPHP: string = $sUnmaskSourceCode($sIndentedPHP, $aTokens);
    const $sFinalTS: string = $sUnmaskSourceCode($sIndentedTS, $aTokens);
    const $sFinalPY: string = $sUnmaskSourceCode($sStrippedPY, $aTranslatedTokensPY);

    return JSOL.dict(
        "success",  true, 
        "js",  $sFinalJS, 
        "php",  $sFinalPHP, 
        "ts",  $sFinalTS, 
        "py",  $sFinalPY
    );
};
