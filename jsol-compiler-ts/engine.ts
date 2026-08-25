declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.96 - Self-Hosted Engine Orchestrator (generic, target-agnostic)
//
// $mExecuteCompilationPipeline no conoce ningún target por nombre. Itera
// sobre $mBackendRegistry, que mapea target id -> función de compilación
// completa para ese target (masked code, prefix, suffix, reglas SSOT,
// tokens -> { code, tokens }). Sumar un target nuevo: un $fCompileBackendX
// nuevo + una línea en el registro. Este archivo no se vuelve a tocar.

const $mResolveWrappers = function($mTargetsConfig: any, $sCliTargetFlag: any, $sCliPrefixOverride: any, $sCliSuffixOverride: any): Record<string, any> {
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
// --- Backend registry: one function per target, uniform signature ---
// ($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules, $aTokens) -> { code, tokens }
// "tokens" is returned (not just "code") because a target may need its own
// transformed token set before unmasking — Python does, to translate "//"
// comments to "#" without ever touching real string literals elsewhere.

const $fCompileBackendJS = function($sMaskedCode: any, $sPrefix: any, $sSuffix: any, $mSSOTRules: any, $aTokens: any) {
  const $sCompiled: string = $sCompileToJS($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    const $sIndented: string = $sIndentCode($sCompiled, "  ");
    return JSOL.dict("code",  $sIndented,  "tokens",  $aTokens);
};
const $fCompileBackendPHP = function($sMaskedCode: any, $sPrefix: any, $sSuffix: any, $mSSOTRules: any, $aTokens: any) {
  const $sCompiled: string = $sCompileToPHP($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    const $sIndented: string = $sIndentCode($sCompiled, "  ");
    return JSOL.dict("code",  $sIndented,  "tokens",  $aTokens);
};
const $fCompileBackendTS = function($sMaskedCode: any, $sPrefix: any, $sSuffix: any, $mSSOTRules: any, $aTokens: any) {
  const $sCompiled: string = $sCompileToJS($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    const $sIndented: string = $sIndentCode($sCompiled, "  ");
    return JSOL.dict("code",  $sIndented,  "tokens",  $aTokens);
};
const $fCompileBackendPython = function($sMaskedCode: any, $sPrefix: any, $sSuffix: any, $mSSOTRules: any, $aTokens: any) {
  const $sCompiled: string = $sCompileToJS($sMaskedCode, $sPrefix, $sSuffix, $mSSOTRules);
    const $sTernary: string = $sConvertTernaries($sCompiled);
    const $sControlFlow: string = $sConvertControlFlowToPython($sTernary);
    const $sSanitized: string = $sSanitizePythonIdentifiers($sControlFlow);
    const $sIndented: string = $sIndentCode($sSanitized, "  ");
    const $sStripped: string = $sStripPythonBraces($sIndented, "  ");
    const $aPyTokens: any[] = $aTranslateCommentTokensToPython($aTokens);
    return JSOL.dict("code",  $sStripped,  "tokens",  $aPyTokens);
};
const $mBackendRegistry: Record<string, any> = JSOL.dict(
    "js",  $fCompileBackendJS, 
    "php",  $fCompileBackendPHP, 
    "ts",  $fCompileBackendTS, 
    "python",  $fCompileBackendPython
);

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
  const $aTargetIds: any[] = Object.keys($mBackendRegistry);
    const $mResults: Record<string, any> = JSOL.dict();

    for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $sTargetId: string = $aTargetIds[$i];
        const $fBackend = $mBackendRegistry[$sTargetId];

        let $sTargetFlag: string = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $sTargetId + "" + "Target") === true) {
      $sTargetFlag = $mCliOptions[$sTargetId + "" + "Target"];
    }
    else if (Object.prototype.hasOwnProperty.call($mCliOptions,  "target") === true) {
      $sTargetFlag = $mCliOptions["target"];
    }
    let $sPrefixArg: string = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $sTargetId + "" + "Prefix") === true) {
      $sPrefixArg = $mCliOptions[$sTargetId + "" + "Prefix"];
    }
    let $sSuffixArg: string = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $sTargetId + "" + "Suffix") === true) {
      $sSuffixArg = $mCliOptions[$sTargetId + "" + "Suffix"];
    }
    const $mWrapperConfig: Record<string, any> = $mTargetsConfig[$sTargetId];
        const $mWrappers: Record<string, any> = $mResolveWrappers($mWrapperConfig, $sTargetFlag, $sPrefixArg, $sSuffixArg);
        const $mSSOTRules: Record<string, any> = $mSSOT["targets"][$sTargetId];

        const $mBackendResult: Record<string, any> = $fBackend($sMaskedCode, $mWrappers["prefix"], $mWrappers["suffix"], $mSSOTRules, $aTokens);
        const $sFinal: string = $sUnmaskSourceCode($mBackendResult["code"], $mBackendResult["tokens"]);

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
