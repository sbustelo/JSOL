<?php
// @JSOL v0.2.96 - Self-Hosted Engine Orchestrator (generic, target-agnostic)
//
// $mExecuteCompilationPipeline no conoce ningún target por nombre. Itera
// sobre $mBackendRegistry, que mapea target id -> función de compilación
// completa para ese target (masked code, prefix, suffix, reglas SSOT,
// tokens -> { code, tokens }). Sumar un target nuevo: un $fCompileBackendX
// nuevo + una línea en el registro. Este archivo no se vuelve a tocar.

$mResolveWrappers = function($mTargetsConfig, $sCliTargetFlag, $sCliPrefixOverride, $sCliSuffixOverride) {
  if (mb_strlen($sCliPrefixOverride, "UTF-8") > 0 || mb_strlen($sCliSuffixOverride, "UTF-8") > 0) {
    return JSOL::dict("prefix",  $sCliPrefixOverride,  "suffix",  $sCliSuffixOverride);
  }
  if (mb_strlen($sCliTargetFlag, "UTF-8") > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$sCliTargetFlag] !== null) {
      $mTargetObj = $mTargetsConfig["targets"][$sCliTargetFlag];
            return JSOL::dict("prefix",  $mTargetObj["prefix"],  "suffix",  $mTargetObj["suffix"]);
    }
  }
  $sDefaultPointer = $mTargetsConfig["default"];
    if ($sDefaultPointer !== null && mb_strlen($sDefaultPointer, "UTF-8") > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$sDefaultPointer] !== null) {
      $mDefaultObj = $mTargetsConfig["targets"][$sDefaultPointer];
            return JSOL::dict("prefix",  $mDefaultObj["prefix"],  "suffix",  $mDefaultObj["suffix"]);
    }
  }
  return JSOL::dict("prefix",  "",  "suffix",  "");
};
// --- Backend registry: one function per target, uniform signature ---
// ($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) -> { code, tokens }
// "tokens" is returned (not just "code") because a target may need its own
// transformed token set before unmasking — Python does, to translate "//"
// comments to "#" without ever touching real string literals elsewhere.

$fCompileBackendJS = function($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) use (&$sCompileToJS, &$sIndentCode) {
  $sCompiled = $sCompileToJS($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    $sIndented = $sIndentCode($sCompiled, "  ");
    return JSOL::dict("code",  $sIndented,  "tokens",  $aTokens);
};
$fCompileBackendPHP = function($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) use (&$sCompileToPHP, &$sIndentCode) {
  $sCompiled = $sCompileToPHP($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    $sIndented = $sIndentCode($sCompiled, "  ");
    return JSOL::dict("code",  $sIndented,  "tokens",  $aTokens);
};
$fCompileBackendTS = function($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) use (&$sCompileToJS, &$sIndentCode) {
  $sCompiled = $sCompileToJS($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    $sIndented = $sIndentCode($sCompiled, "  ");
    return JSOL::dict("code",  $sIndented,  "tokens",  $aTokens);
};
$fCompileBackendPython = function($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) use (&$sCompileToJS, &$sConvertTernaries, &$sConvertControlFlowToPython, &$sSanitizePythonIdentifiers, &$sIndentCode, &$sStripPythonBraces, &$aTranslateCommentTokensToPython) {
  $sCompiled = $sCompileToJS($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    $sTernary = $sConvertTernaries($sCompiled);
    $sControlFlow = $sConvertControlFlowToPython($sTernary);
    $sSanitized = $sSanitizePythonIdentifiers($sControlFlow);
    $sIndented = $sIndentCode($sSanitized, "  ");
    $sStripped = $sStripPythonBraces($sIndented, "  ");
    $aPyTokens = $aTranslateCommentTokensToPython($aTokens);
    return JSOL::dict("code",  $sStripped,  "tokens",  $aPyTokens);
};
$mBackendRegistry = JSOL::dict(
    "js",  $fCompileBackendJS, 
    "php",  $fCompileBackendPHP, 
    "ts",  $fCompileBackendTS, 
    "python",  $fCompileBackendPython
);

$mExecuteCompilationPipeline = function($sSourceCode, $mTargetsConfig, $mCliOptions, $mSSOT) use (&$mMaskSourceCode, &$sUnmaskSourceCode, &$mAuditPragma, &$mAuditForbiddenPatterns, &$mAuditStrictTyping, &$mResolveWrappers, &$mBackendRegistry) {
  $mPragmaResult = $mAuditPragma($sSourceCode);
    if ($mPragmaResult["valid"] === false) {
    return JSOL::dict("success",  false,  "errors",  $mPragmaResult["errors"]);
  }
  $mMaskedData = $mMaskSourceCode($sSourceCode);
    $sMaskedCode = $mMaskedData["maskedCode"];
    $aTokens = $mMaskedData["tokens"];

    $mPatternResult = $mAuditForbiddenPatterns($sMaskedCode);
    if ($mPatternResult["valid"] === false) {
    return JSOL::dict("success",  false,  "errors",  $mPatternResult["errors"]);
  }
  $mTypingResult = $mAuditStrictTyping($sMaskedCode, $mSSOT);
    if ($mTypingResult["valid"] === false) {
    return JSOL::dict("success",  false,  "errors",  $mTypingResult["errors"]);
  }
  $aTargetIds = array_keys($mBackendRegistry);
    $mResults = JSOL::dict();

    for ($i = 0; $i < count($aTargetIds); $i = $i + 1) {
    $sTargetId = $aTargetIds[$i];
        $fBackend = $mBackendRegistry[$sTargetId];

        $sTargetFlag = "";
        if (isset($mCliOptions[ $sTargetId . "" . "Target"]) === true) {
      $sTargetFlag = $mCliOptions[$sTargetId . "" . "Target"];
    }
    else if (isset($mCliOptions[ "target"]) === true) {
      $sTargetFlag = $mCliOptions["target"];
    }
    $sPrefixArg = "";
        if (isset($mCliOptions[ $sTargetId . "" . "Prefix"]) === true) {
      $sPrefixArg = $mCliOptions[$sTargetId . "" . "Prefix"];
    }
    $sSuffixArg = "";
        if (isset($mCliOptions[ $sTargetId . "" . "Suffix"]) === true) {
      $sSuffixArg = $mCliOptions[$sTargetId . "" . "Suffix"];
    }
    $mWrapperConfig = $mTargetsConfig[$sTargetId];
        $mWrappers = $mResolveWrappers($mWrapperConfig, $sTargetFlag, $sPrefixArg, $sSuffixArg);
        $mSSOTRules = $mSSOT["targets"][$sTargetId];

        $mBackendResult = $fBackend($sMaskedCode, $mWrappers["prefix"], $mWrappers["suffix"], $mSSOTRules, $aTokens);
        $sFinal = $sUnmaskSourceCode($mBackendResult["code"], $mBackendResult["tokens"]);

        $mResults[$sTargetId] = $sFinal;
  }
  return JSOL::dict(
        "success",  true, 
        "js",  $mResults["js"], 
        "php",  $mResults["php"], 
        "ts",  $mResults["ts"], 
        "py",  $mResults["python"]
    );
};
