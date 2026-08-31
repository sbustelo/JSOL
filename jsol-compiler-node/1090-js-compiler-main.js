// @JSOL v0.2.97 - JS Target Compiler (Blind Router)
const $sCompileToJS = function ($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules) {
  let $saTransformed = $saComp_ExpandSymbols($saMaskedCode);

	let $saMetaShadowRef = "";
	if (Object.prototype.hasOwnProperty.call($mSSOTRules,  "meta") === true) {
    const $mMeta = $mSSOTRules["meta"];
		if (Object.prototype.hasOwnProperty.call($mMeta,  "templates") === true) {
      if (Object.prototype.hasOwnProperty.call($mMeta["templates"],  "shadow_map_ref") === true) {
        $saMetaShadowRef = $mMeta["templates"]["shadow_map_ref"];
      }
    }
  }
  if (Object.prototype.hasOwnProperty.call($mSSOTRules,  "operations") === true) {
    const $mOperations = $mSSOTRules["operations"];
		const $aOpKeys = Object.keys($mOperations);
		const $iOpCount = $aOpKeys.length;

		for (let $iR = 0; $iR < $iOpCount; $iR = $iR + 1) {
      const $saId = $aOpKeys[$iR];
			const $mOp = $mOperations[$saId];
			
			const $saType = Object.prototype.hasOwnProperty.call($mOp,  "type") ? $mOp["type"] : "call";
			const $saTemplate = Object.prototype.hasOwnProperty.call($mOp,  "fallback") ? $mOp["fallback"]["template"] : $mOp["template"];

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
    const $aRules = $mSSOTRules;
		const $iRulesCount = $aRules.length;
		for (let $iR = 0; $iR < $iRulesCount; $iR = $iR + 1) {
      const $mRule = $aRules[$iR];
			const $saType = $mRule["type"];
			const $saId = $mRule["id"];
			const $saTemplate = $mRule["template"];

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
