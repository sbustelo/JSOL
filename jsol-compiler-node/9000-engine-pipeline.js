// @JSOL v0.2.97 - Self-Hosted Engine Orchestrator

const $mResolveWrappers = function($mTargetsConfig, $saCliTargetFlag, $saCliPrefixOverride, $saCliSuffixOverride) {
  if (Str["len"]($saCliPrefixOverride) > 0 || Str["len"]($saCliSuffixOverride) > 0) {
    return JSOL.dict("prefix",  $saCliPrefixOverride,  "suffix",  $saCliSuffixOverride);
  }
  if (Str["len"]($saCliTargetFlag) > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$saCliTargetFlag] !== null) {
      const $mTargetObj = $mTargetsConfig["targets"][$saCliTargetFlag];
            return JSOL.dict("prefix",  $mTargetObj["prefix"],  "suffix",  $mTargetObj["suffix"]);
    }
  }
  const $saDefaultPointer = $mTargetsConfig["default"];
    if ($saDefaultPointer !== null && Str["len"]($saDefaultPointer) > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$saDefaultPointer] !== null) {
      const $mDefaultObj = $mTargetsConfig["targets"][$saDefaultPointer];
            return JSOL.dict("prefix",  $mDefaultObj["prefix"],  "suffix",  $mDefaultObj["suffix"]);
    }
  }
  return JSOL.dict("prefix",  "",  "suffix",  "");
};
const $fCompileBackendJS = function($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules, $aTokens) {
  const $saCompiled = $sCompileToJS($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    const $saIndented = $saIndentCode($saCompiled, "  ");
    return JSOL.dict("code",  $saIndented,  "tokens",  $aTokens);
};
const $fCompileBackendPHP = function($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules, $aTokens) {
  const $saCompiled = $sCompileToPHP($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    const $saIndented = $saIndentCode($saCompiled, "  ");
    return JSOL.dict("code",  $saIndented,  "tokens",  $aTokens);
};
const $fCompileBackendTS = function($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules, $aTokens) {
  const $saCompiled = $sCompileToJS($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    const $saIndented = $saIndentCode($saCompiled, "  ");
    return JSOL.dict("code",  $saIndented,  "tokens",  $aTokens);
};
const $fCompileBackendPython = function($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules, $aTokens) {
  const $saCompiled = $sCompileToJS($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    const $saControlFlow = $saConvertControlFlowToPython($saCompiled);
    const $saTernary = $saConvertTernaries($saControlFlow);
    const $saSanitized = $saSanitizePythonIdentifiers($saTernary);
    const $saIndented = $saIndentCode($saSanitized, "  ");
    const $saStripped = $saStripPythonBraces($saIndented, "  ");
    const $aPyTokens = $aTranslateCommentTokensToPython($aTokens);
    return JSOL.dict("code",  $saStripped,  "tokens",  $aPyTokens);
};
const $mBackendRegistry = JSOL.dict(
    "js",  $fCompileBackendJS, 
    "php",  $fCompileBackendPHP, 
    "ts",  $fCompileBackendTS, 
    "python",  $fCompileBackendPython
);

const $mExecuteCompilationPipeline = function($saSourceCode, $mTargetsConfig, $mCliOptions, $mSSOT) {
  const $mPragmaResult = $mAuditPragma($saSourceCode);
    if ($mPragmaResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mPragmaResult["errors"]);
  }
  const $mMaskedData = $mMaskSourceCode($saSourceCode);
    const $saMaskedCode = $mMaskedData["maskedCode"];
    const $aTokens = $mMaskedData["tokens"];

    const $mPatternResult = $mAuditForbiddenPatterns($saMaskedCode);
    if ($mPatternResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mPatternResult["errors"]);
  }
  const $mTypingResult = $mAuditStrictTyping($saMaskedCode, $mSSOT);
    if ($mTypingResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mTypingResult["errors"]);
  }
  const $aTargetIds = Object.keys($mBackendRegistry);
    const $mResults = JSOL.dict();

    for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $saTargetId = $aTargetIds[$i];
        const $fBackend = $mBackendRegistry[$saTargetId];

        let $saTargetFlag = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $saTargetId + "" + "Target") === true) {
      $saTargetFlag = $mCliOptions[$saTargetId + "" + "Target"];
    }
    else if (Object.prototype.hasOwnProperty.call($mCliOptions,  "target") === true) {
      $saTargetFlag = $mCliOptions["target"];
    }
    let $saPrefixArg = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $saTargetId + "" + "Prefix") === true) {
      $saPrefixArg = $mCliOptions[$saTargetId + "" + "Prefix"];
    }
    let $saSuffixArg = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $saTargetId + "" + "Suffix") === true) {
      $saSuffixArg = $mCliOptions[$saTargetId + "" + "Suffix"];
    }
    const $mWrapperConfig = $mTargetsConfig[$saTargetId];
        const $mWrappers = $mResolveWrappers($mWrapperConfig, $saTargetFlag, $saPrefixArg, $saSuffixArg);
        const $mSSOTRules = $mSSOT["targets"][$saTargetId];

        const $mBackendResult = $fBackend($saMaskedCode, $mWrappers["prefix"], $mWrappers["suffix"], $mSSOTRules, $aTokens);
        const $saFinal = $saUnmaskSourceCode($mBackendResult["code"], $mBackendResult["tokens"]);

        $mResults[$saTargetId] = $saFinal;
  }
  return JSOL.dict(
        "success",  true, 
        "js",  $mResults["js"], 
        "php",  $mResults["php"], 
        "ts",  $mResults["ts"], 
        "py",  $mResults["python"]
    );
};
