declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - Self-Hosted Engine Orchestrator

const $mResolveWrappers = function($mTargetsConfig: any, $saCliTargetFlag: any, $saCliPrefixOverride: any, $saCliSuffixOverride: any): Record<string, any> {
  if (Str["len"]($saCliPrefixOverride) > 0 || Str["len"]($saCliSuffixOverride) > 0) {
    return JSOL.dict("prefix",  $saCliPrefixOverride,  "suffix",  $saCliSuffixOverride);
  }
  if (Str["len"]($saCliTargetFlag) > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$saCliTargetFlag] !== null) {
      const $mTargetObj: Record<string, any> = $mTargetsConfig["targets"][$saCliTargetFlag];
            return JSOL.dict("prefix",  $mTargetObj["prefix"],  "suffix",  $mTargetObj["suffix"]);
    }
  }
  const $saDefaultPointer: string = $mTargetsConfig["default"];
    if ($saDefaultPointer !== null && Str["len"]($saDefaultPointer) > 0) {
    if ($mTargetsConfig["targets"] !== null && $mTargetsConfig["targets"][$saDefaultPointer] !== null) {
      const $mDefaultObj: Record<string, any> = $mTargetsConfig["targets"][$saDefaultPointer];
            return JSOL.dict("prefix",  $mDefaultObj["prefix"],  "suffix",  $mDefaultObj["suffix"]);
    }
  }
  return JSOL.dict("prefix",  "",  "suffix",  "");
};
const $fCompileBackendJS = function($saMaskedCode: any, $saPrefix: any, $saSuffix: any, $mSSOTRules: any, $aTokens: any) {
  const $saCompiled: string = $sCompileToJS($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    const $saIndented: string = $saIndentCode($saCompiled, "  ");
    return JSOL.dict("code",  $saIndented,  "tokens",  $aTokens);
};
const $fCompileBackendPHP = function($saMaskedCode: any, $saPrefix: any, $saSuffix: any, $mSSOTRules: any, $aTokens: any) {
  const $saCompiled: string = $sCompileToPHP($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    const $saIndented: string = $saIndentCode($saCompiled, "  ");
    return JSOL.dict("code",  $saIndented,  "tokens",  $aTokens);
};
const $fCompileBackendTS = function($saMaskedCode: any, $saPrefix: any, $saSuffix: any, $mSSOTRules: any, $aTokens: any) {
  const $saCompiled: string = $sCompileToJS($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    const $saIndented: string = $saIndentCode($saCompiled, "  ");
    return JSOL.dict("code",  $saIndented,  "tokens",  $aTokens);
};
const $fCompileBackendPython = function($saMaskedCode: any, $saPrefix: any, $saSuffix: any, $mSSOTRules: any, $aTokens: any) {
  const $saCompiled: string = $sCompileToJS($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules);
    const $saControlFlow: string = $saConvertControlFlowToPython($saCompiled);
    const $saTernary: string = $saConvertTernaries($saControlFlow);
    const $saSanitized: string = $saSanitizePythonIdentifiers($saTernary);
    const $saIndented: string = $saIndentCode($saSanitized, "  ");
    const $saStripped: string = $saStripPythonBraces($saIndented, "  ");
    const $aPyTokens: any[] = $aTranslateCommentTokensToPython($aTokens);
    return JSOL.dict("code",  $saStripped,  "tokens",  $aPyTokens);
};
const $mBackendRegistry: Record<string, any> = JSOL.dict(
    "js",  $fCompileBackendJS, 
    "php",  $fCompileBackendPHP, 
    "ts",  $fCompileBackendTS, 
    "python",  $fCompileBackendPython
);

const $mExecuteCompilationPipeline = function($saSourceCode: any, $mTargetsConfig: any, $mCliOptions: any, $mSSOT: any): Record<string, any> {
  const $mPragmaResult: Record<string, any> = $mAuditPragma($saSourceCode);
    if ($mPragmaResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mPragmaResult["errors"]);
  }
  const $mMaskedData: Record<string, any> = $mMaskSourceCode($saSourceCode);
    const $saMaskedCode: string = $mMaskedData["maskedCode"];
    const $aTokens: any[] = $mMaskedData["tokens"];

    const $mPatternResult: Record<string, any> = $mAuditForbiddenPatterns($saMaskedCode);
    if ($mPatternResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mPatternResult["errors"]);
  }
  const $mTypingResult: Record<string, any> = $mAuditStrictTyping($saMaskedCode, $mSSOT);
    if ($mTypingResult["valid"] === false) {
    return JSOL.dict("success",  false,  "errors",  $mTypingResult["errors"]);
  }
  const $aTargetIds: any[] = Object.keys($mBackendRegistry);
    const $mResults: Record<string, any> = JSOL.dict();

    for (let $i = 0; $i < $aTargetIds.length; $i = $i + 1) {
    const $saTargetId: string = $aTargetIds[$i];
        const $fBackend = $mBackendRegistry[$saTargetId];

        let $saTargetFlag: string = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $saTargetId + "" + "Target") === true) {
      $saTargetFlag = $mCliOptions[$saTargetId + "" + "Target"];
    }
    else if (Object.prototype.hasOwnProperty.call($mCliOptions,  "target") === true) {
      $saTargetFlag = $mCliOptions["target"];
    }
    let $saPrefixArg: string = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $saTargetId + "" + "Prefix") === true) {
      $saPrefixArg = $mCliOptions[$saTargetId + "" + "Prefix"];
    }
    let $saSuffixArg: string = "";
        if (Object.prototype.hasOwnProperty.call($mCliOptions,  $saTargetId + "" + "Suffix") === true) {
      $saSuffixArg = $mCliOptions[$saTargetId + "" + "Suffix"];
    }
    const $mWrapperConfig: Record<string, any> = $mTargetsConfig[$saTargetId];
        const $mWrappers: Record<string, any> = $mResolveWrappers($mWrapperConfig, $saTargetFlag, $saPrefixArg, $saSuffixArg);
        const $mSSOTRules: Record<string, any> = $mSSOT["targets"][$saTargetId];

        const $mBackendResult: Record<string, any> = $fBackend($saMaskedCode, $mWrappers["prefix"], $mWrappers["suffix"], $mSSOTRules, $aTokens);
        const $saFinal: string = $saUnmaskSourceCode($mBackendResult["code"], $mBackendResult["tokens"]);

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
