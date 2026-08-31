<?php
// @JSOL v0.2.97 - Self-Hosted Engine Orchestrator

$mResolveWrappers = function($mTargetsConfig, $saCliTargetFlag, $saCliPrefixOverride, $saCliSuffixOverride) {
  if (mb_strlen($saCliPrefixOverride, "UTF-8") > 0 || mb_strlen($saCliSuffixOverride, "UTF-8") > 0) {
    return JSOL::dict("prefix",  $saCliPrefixOverride,  "suffix",  $saCliSuffixOverride);
  }
  if (mb_strlen($saCliTargetFlag, "UTF-8") > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$saCliTargetFlag] !== null) {
      $mTargetObj = $mTargetsConfig["targets"][$saCliTargetFlag];
            return JSOL::dict("prefix",  $mTargetObj["prefix"],  "suffix",  $mTargetObj["suffix"]);
    }
  }
  $saDefaultPointer = $mTargetsConfig["default"];
    if ($saDefaultPointer !== null && mb_strlen($saDefaultPointer, "UTF-8") > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$saDefaultPointer] !== null) {
      $mDefaultObj = $mTargetsConfig["targets"][$saDefaultPointer];
            return JSOL::dict("prefix",  $mDefaultObj["prefix"],  "suffix",  $mDefaultObj["suffix"]);
    }
  }
  return JSOL::dict("prefix",  "",  "suffix",  "");
};
$fCompileBackendJS = function($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules, $aTokens) use (&$sCompileToJS, &$saIndentCode) {
  $saCompiled = $sCompileToJS($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    $saIndented = $saIndentCode($saCompiled, "  ");
    return JSOL::dict("code",  $saIndented,  "tokens",  $aTokens);
};
$fCompileBackendPHP = function($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules, $aTokens) use (&$sCompileToPHP, &$saIndentCode) {
  $saCompiled = $sCompileToPHP($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    $saIndented = $saIndentCode($saCompiled, "  ");
    return JSOL::dict("code",  $saIndented,  "tokens",  $aTokens);
};
$fCompileBackendTS = function($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules, $aTokens) use (&$sCompileToJS, &$saIndentCode) {
  $saCompiled = $sCompileToJS($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    $saIndented = $saIndentCode($saCompiled, "  ");
    return JSOL::dict("code",  $saIndented,  "tokens",  $aTokens);
};
$fCompileBackendPython = function($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules, $aTokens) use (&$sCompileToJS, &$saConvertControlFlowToPython, &$saConvertTernaries, &$saSanitizePythonIdentifiers, &$saIndentCode, &$saStripPythonBraces, &$aTranslateCommentTokensToPython) {
  $saCompiled = $sCompileToJS($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    $saControlFlow = $saConvertControlFlowToPython($saCompiled);
    $saTernary = $saConvertTernaries($saControlFlow);
    $saSanitized = $saSanitizePythonIdentifiers($saTernary);
    $saIndented = $saIndentCode($saSanitized, "  ");
    $saStripped = $saStripPythonBraces($saIndented, "  ");
    $aPyTokens = $aTranslateCommentTokensToPython($aTokens);
    return JSOL::dict("code",  $saStripped,  "tokens",  $aPyTokens);
};
$mBackendRegistry = JSOL::dict(
    "js",  $fCompileBackendJS, 
    "php",  $fCompileBackendPHP, 
    "ts",  $fCompileBackendTS, 
    "python",  $fCompileBackendPython
);

$mExecuteCompilationPipeline = function($saSourceCode, $mTargetsConfig, $mCliOptions, $mSSOT) use (&$mMaskSourceCode, &$saUnmaskSourceCode, &$mAuditPragma, &$mAuditForbiddenPatterns, &$mAuditStrictTyping, &$mResolveWrappers, &$mBackendRegistry) {
  $mPragmaResult = $mAuditPragma($saSourceCode);
    if ($mPragmaResult["valid"] === false) {
    return JSOL::dict("success",  false,  "errors",  $mPragmaResult["errors"]);
  }
  $mMaskedData = $mMaskSourceCode($saSourceCode);
    $saMaskedCode = $mMaskedData["maskedCode"];
    $aTokens = $mMaskedData["tokens"];

    $mPatternResult = $mAuditForbiddenPatterns($saMaskedCode);
    if ($mPatternResult["valid"] === false) {
    return JSOL::dict("success",  false,  "errors",  $mPatternResult["errors"]);
  }
  $mTypingResult = $mAuditStrictTyping($saMaskedCode, $mSSOT);
    if ($mTypingResult["valid"] === false) {
    return JSOL::dict("success",  false,  "errors",  $mTypingResult["errors"]);
  }
  $aTargetIds = array_keys($mBackendRegistry);
    $mResults = JSOL::dict();

    for ($i = 0; $i < count($aTargetIds); $i = $i + 1) {
    $saTargetId = $aTargetIds[$i];
        $fBackend = $mBackendRegistry[$saTargetId];

        $saTargetFlag = "";
        if (isset($mCliOptions[ $saTargetId . "" . "Target"]) === true) {
      $saTargetFlag = $mCliOptions[$saTargetId . "" . "Target"];
    }
    else if (isset($mCliOptions[ "target"]) === true) {
      $saTargetFlag = $mCliOptions["target"];
    }
    $saPrefixArg = "";
        if (isset($mCliOptions[ $saTargetId . "" . "Prefix"]) === true) {
      $saPrefixArg = $mCliOptions[$saTargetId . "" . "Prefix"];
    }
    $saSuffixArg = "";
        if (isset($mCliOptions[ $saTargetId . "" . "Suffix"]) === true) {
      $saSuffixArg = $mCliOptions[$saTargetId . "" . "Suffix"];
    }
    $mWrapperConfig = $mTargetsConfig[$saTargetId];
        $mWrappers = $mResolveWrappers($mWrapperConfig, $saTargetFlag, $saPrefixArg, $saSuffixArg);
        $mSSOTRules = $mSSOT["targets"][$saTargetId];

        $mBackendResult = $fBackend($saMaskedCode, $mWrappers["prefix"], $mWrappers["suffix"], $mSSOTRules, $aTokens);
        $saFinal = $saUnmaskSourceCode($mBackendResult["code"], $mBackendResult["tokens"]);

        $mResults[$saTargetId] = $saFinal;
  }
  return JSOL::dict(
        "success",  true, 
        "js",  $mResults["js"], 
        "php",  $mResults["php"], 
        "ts",  $mResults["ts"], 
        "py",  $mResults["python"]
    );
};
