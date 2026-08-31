declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - JS Target Compiler (Blind Router)
const $sCompileToJS = function($saMaskedCode: any, $saPrefix: any, $saSuffix: any, $mSSOTRules: any): string {
  let $saTransformed: string = $saComp_ExpandSymbols($saMaskedCode);

	let $saMetaShadowRef: string = "";
	if (Object.prototype.hasOwnProperty.call($mSSOTRules,  "meta") === true) {
    const $mMeta: Record<string, any> = $mSSOTRules["meta"];
		if (Object.prototype.hasOwnProperty.call($mMeta,  "templates") === true) {
      if (Object.prototype.hasOwnProperty.call($mMeta["templates"],  "shadow_map_ref") === true) {
        $saMetaShadowRef = $mMeta["templates"]["shadow_map_ref"];
      }
    }
  }
  if (Object.prototype.hasOwnProperty.call($mSSOTRules,  "operations") === true) {
    const $mOperations: Record<string, any> = $mSSOTRules["operations"];
		const $aOpKeys: any[] = Object.keys($mOperations);
		const $iOpCount: number = $aOpKeys.length;

		for (let $iR = 0; $iR < $iOpCount; $iR = $iR + 1) {
      const $saId: string = $aOpKeys[$iR];
			const $mOp: Record<string, any> = $mOperations[$saId];
			
			const $saType: string = Object.prototype.hasOwnProperty.call($mOp,  "type") ? $mOp["type"] : "call";
			const $saTemplate: string = Object.prototype.hasOwnProperty.call($mOp,  "fallback") ? $mOp["fallback"]["template"] : $mOp["template"];

			if ($saType === "block") {
        $saTransformed = $fProcessBlock($saTransformed, $saId, $saTemplate === "unwrap");
      }
      else if ($saType === "regex") {
        $saTransformed = Rgx.replace($mOp["search"],  $saTemplate,  $saTransformed,  "g");
      }
      else if ($saType === "replace") {
        $saTransformed = Str["replace"]($saTransformed,  $saId,  $saTemplate);
      }
      else if ($saType === "call") {
        $saTransformed = $fProcessCall($saTransformed, $saId + "(", $saTemplate, $saMetaShadowRef);
      }
      else if ($saType === "paramtype") {
        $saTransformed = $fProcessParams($saTransformed);
      }
      else if ($saType === "range") {
        $saTransformed = $fProcessRange($saTransformed);
      }
    }
  }
  else {
    const $aRules: any[] = $mSSOTRules;
		const $iRulesCount: number = $aRules.length;
		for (let $iR = 0; $iR < $iRulesCount; $iR = $iR + 1) {
      const $mRule: Record<string, any> = $aRules[$iR];
			const $saType: string = $mRule["type"];
			const $saId: string = $mRule["id"];
			const $saTemplate: string = $mRule["template"];

			if ($saType === "block") {
        $saTransformed = $fProcessBlock($saTransformed, $saId, $saTemplate === "unwrap");
      }
      else if ($saType === "regex") {
        $saTransformed = Rgx.replace($mRule["search"],  $saTemplate,  $saTransformed,  "g");
      }
      else if ($saType === "replace") {
        $saTransformed = Str["replace"]($saTransformed,  $saId,  $saTemplate);
      }
      else if ($saType === "call") {
        $saTransformed = $fProcessCall($saTransformed, $saId + "(", $saTemplate, "");
      }
      else if ($saType === "paramtype") {
        $saTransformed = $fProcessParams($saTransformed);
      }
      else if ($saType === "range") {
        $saTransformed = $fProcessRange($saTransformed);
      }
    }
  }
  return $saPrefix + "" + $saTransformed + "" + $saSuffix;
};
