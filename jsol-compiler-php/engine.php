<?php
// @JSOL v0.2.93 - Self-Hosted Engine Orchestrator
$mResolveWrappers = function($mTargetsConfig, $sCliTargetFlag, $sCliPrefixOverride, $sCliSuffixOverride) {
    $sPrefix = "";
    $sSuffix = "";
    if (mb_strlen($sCliPrefixOverride, "UTF-8") > 0 || mb_strlen($sCliSuffixOverride, "UTF-8") > 0) {
        return JSOL::dict("prefix", $sCliPrefixOverride, "suffix", $sCliSuffixOverride);
    }
    if (mb_strlen($sCliTargetFlag, "UTF-8") > 0) {
        if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$sCliTargetFlag] !== null) {
            $mTargetObj = $mTargetsConfig["targets"][$sCliTargetFlag];
            return JSOL::dict("prefix", $mTargetObj["prefix"], "suffix", $mTargetObj["suffix"]);
        }
    }
    $sDefaultPointer = $mTargetsConfig["default"];
    if ($sDefaultPointer !== null && mb_strlen($sDefaultPointer, "UTF-8") > 0) {
        if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$sDefaultPointer] !== null) {
            $mDefaultObj = $mTargetsConfig["targets"][$sDefaultPointer];
            return JSOL::dict("prefix", $mDefaultObj["prefix"], "suffix", $mDefaultObj["suffix"]);
        }
    }
    return JSOL::dict("prefix", "", "suffix", "");
};

$mExecuteCompilationPipeline = function($sSourceCode, $mTargetsConfig, $mCliOptions) use ($mMaskSourceCode, $sUnmaskSourceCode, $mAuditPragma, $mAuditForbiddenPatterns, $sCompileToJS, $sCompileToPHP, $mResolveWrappers) {


    $mPragmaResult = $mAuditPragma($sSourceCode);
    if ($mPragmaResult["valid"] === false) {
        return JSOL::dict("success", false, "errors", $mPragmaResult["errors"]);
    }

    $mMaskedData = $mMaskSourceCode($sSourceCode);
    $sMaskedCode = $mMaskedData["maskedCode"];
    $aTokens = $mMaskedData["tokens"];

    $mPatternResult = $mAuditForbiddenPatterns($sMaskedCode);
    if ($mPatternResult["valid"] === false) {
        return JSOL::dict("success", false, "errors", $mPatternResult["errors"]);
    }

    $sJsTargetFlag = $mCliOptions["jsTarget"];
    $sJsPrefixArg = $mCliOptions["jsPrefix"];
    $sJsSuffixArg = $mCliOptions["jsSuffix"];
    $mJsWrappers = $mResolveWrappers($mTargetsConfig["js"], $sJsTargetFlag, $sJsPrefixArg, $sJsSuffixArg);

    $sPhpTargetFlag = $mCliOptions["phpTarget"];
    $sPhpPrefixArg = $mCliOptions["phpPrefix"];
    $sPhpSuffixArg = $mCliOptions["phpSuffix"];
    $mPhpWrappers = $mResolveWrappers($mTargetsConfig["php"], $sPhpTargetFlag, $sPhpPrefixArg, $sPhpSuffixArg);

    $sCompiledJS = $sCompileToJS($sMaskedCode, $mJsWrappers["prefix"], $mJsWrappers["suffix"]);
    $sCompiledPHP = $sCompileToPHP($sMaskedCode, $mPhpWrappers["prefix"], $mPhpWrappers["suffix"]);

    $sFinalJS = $sUnmaskSourceCode($sCompiledJS, $aTokens);
    $sFinalPHP = $sUnmaskSourceCode($sCompiledPHP, $aTokens);

    return JSOL::dict(
        "success", true,
        "js", $sFinalJS,
        "php", $sFinalPHP
    );
};