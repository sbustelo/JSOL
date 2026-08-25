// @JSOL v0.2.96 - Self-Hosted Engine Orchestrator (generic, target-agnostic)
//
// $mExecuteCompilationPipeline no conoce ningún target por nombre. Itera
// sobre $mBackendRegistry, que mapea target id -> función de compilación
// completa para ese target (masked code, prefix, suffix, reglas SSOT,
// tokens -> { code, tokens }). Sumar un target nuevo: un $fCompileBackendX
// nuevo + una línea en el registro. Este archivo no se vuelve a tocar.

const $mResolveWrappers = function($mTargetsConfig, $sCliTargetFlag, $sCliPrefixOverride, $sCliSuffixOverride) {
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
// --- Backend registry: one function per target, uniform signature ---
// ($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) -> { code, tokens }
// "tokens" is returned (not just "code") because a target may need its own
// transformed token set before unmasking — Python does, to translate "//"
// comments to "#" without ever touching real string literals elsewhere.

const $fCompileBackendJS = function($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) {
  const $sCompiled = $sCompileToJS($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    const $sIndented = $sIndentCode($sCompiled, "  ");
    return JSOL.dict("code",  $sIndented,  "tokens",  $aTokens);
};
const $fCompileBackendPHP = function($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) {
  const $sCompiled = $sCompileToPHP($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    const $sIndented = $sIndentCode($sCompiled, "  ");
    return JSOL.dict("code",  $sIndented,  "tokens",  $aTokens);
};
const $fCompileBackendTS = function($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) {
  const $sCompiled = $sCompileToJS($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    const $sIndented = $sIndentCode($sCompiled, "  ");
    return JSOL.dict("code",  $sIndented,  "tokens",  $aTokens);
};
const $fCompileBackendPython = function($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) {
  const $sCompiled = $sCompileToJS($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    const $sTernary = $sConvertTernaries($sCompiled);
    const $sControlFlow = $sConvertControlFlowToPython($sTernary);
    const $sSanitized = $sSanitizePythonIdentifiers($sControlFlow);
    const $sIndented = $sIndentCode($sSanitized, "  ");
    const $sStripped = $sStripPythonBraces($sIndented, "  ");
    const $aPyTokens = $aTranslateCommentTokensToPython($aTokens);
    return JSOL.dict("code",  $sStripped,  "tokens",  $aPyTokens);
};
const $mBackendRegistry = JSOL.dict(
    "js",  $fCompileBackendJS, 
    "php",  $fCompileBackendPHP, 
    "ts",  $fCompileBackendTS, 
    "python",  $fCompileBackendPython
);

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
  const $aTargetIds = Object.keys($mBackendRegistry);
    const $mResults = JSOL.dict();

    for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $sTargetId = $aTargetIds[$i];
        const $fBackend = $mBackendRegistry[$sTargetId];

        let $sTargetFlag = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $sTargetId + "" + "Target") === true) {
      $sTargetFlag = $mCliOptions[$sTargetId + "" + "Target"];
    }
    else if (Object.prototype.hasOwnProperty.call($mCliOptions,  "target") === true) {
      $sTargetFlag = $mCliOptions["target"];
    }
    let $sPrefixArg = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $sTargetId + "" + "Prefix") === true) {
      $sPrefixArg = $mCliOptions[$sTargetId + "" + "Prefix"];
    }
    let $sSuffixArg = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $sTargetId + "" + "Suffix") === true) {
      $sSuffixArg = $mCliOptions[$sTargetId + "" + "Suffix"];
    }
    const $mWrapperConfig = $mTargetsConfig[$sTargetId];
        const $mWrappers = $mResolveWrappers($mWrapperConfig, $sTargetFlag, $sPrefixArg, $sSuffixArg);
        const $mSSOTRules = $mSSOT["targets"][$sTargetId];

        const $mBackendResult = $fBackend($sMaskedCode, $mWrappers["prefix"], $mWrappers["suffix"], $mSSOTRules, $aTokens);
        const $sFinal = $sUnmaskSourceCode($mBackendResult["code"], $mBackendResult["tokens"]);

        $mResults[$sTargetId] = $sFinal;
  }
  return JSOL.dict(
        "success",  true, 
        "js",  $mResults["js"], 
        "php",  $mResults["php"], 
        "ts",  $mResults["ts"], 
        "py",  $mResults["python"]
    );
};
