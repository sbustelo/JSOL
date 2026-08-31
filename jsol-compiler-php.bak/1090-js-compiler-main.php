<?php
// @JSOL v0.2.97 - JS Target Compiler (Blind Router)
$sCompileToJS = function($saMaskedCode, $saPrefix, $saSuffix, $mSSOTRules) use (&$fProcessBlock, &$fProcessCall, &$fProcessParams, &$fProcessRange, &$saComp_ExpandSymbols) {
  $saTransformed = $saComp_ExpandSymbols($saMaskedCode);

	$saMetaShadowRef = "";
	if (isset($mSSOTRules[ "meta"]) === true) {
    $mMeta = $mSSOTRules["meta"];
		if (isset($mMeta[ "templates"]) === true) {
      if (isset($mMeta["templates"][ "shadow_map_ref"]) === true) {
        $saMetaShadowRef = $mMeta["templates"]["shadow_map_ref"];
      }
    }
  }
  if (isset($mSSOTRules[ "operations"]) === true) {
    $mOperations = $mSSOTRules["operations"];
		$aOpKeys = array_keys($mOperations);
		$iOpCount = count($aOpKeys);

		for ($iR = 0; $iR < $iOpCount; $iR = $iR + 1) {
      $saId = $aOpKeys[$iR];
			$mOp = $mOperations[$saId];
			
			$saType = isset($mOp[ "type"]) ? $mOp["type"] : "call";
			$saTemplate = isset($mOp[ "fallback"]) ? $mOp["fallback"]["template"] : $mOp["template"];

			if ($saType === "block") {
        $saTransformed = $fProcessBlock($saTransformed, $saId, $saTemplate === "unwrap");
      }
      else if ($saType === "regex") {
        $saTransformed = Rgx::replace($mOp["search"],  $saTemplate,  $saTransformed,  "g");
      }
      else if ($saType === "replace") {
        $saTransformed = str_replace( $saId,  $saTemplate, $saTransformed);
      }
      else if ($saType === "call") {
        $saTransformed = $fProcessCall($saTransformed, $saId . "(", $saTemplate, $saMetaShadowRef);
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
    $aRules = $mSSOTRules;
		$iRulesCount = count($aRules);
		for ($iR = 0; $iR < $iRulesCount; $iR = $iR + 1) {
      $mRule = $aRules[$iR];
			$saType = $mRule["type"];
			$saId = $mRule["id"];
			$saTemplate = $mRule["template"];

			if ($saType === "block") {
        $saTransformed = $fProcessBlock($saTransformed, $saId, $saTemplate === "unwrap");
      }
      else if ($saType === "regex") {
        $saTransformed = Rgx::replace($mRule["search"],  $saTemplate,  $saTransformed,  "g");
      }
      else if ($saType === "replace") {
        $saTransformed = str_replace( $saId,  $saTemplate, $saTransformed);
      }
      else if ($saType === "call") {
        $saTransformed = $fProcessCall($saTransformed, $saId . "(", $saTemplate, "");
      }
      else if ($saType === "paramtype") {
        $saTransformed = $fProcessParams($saTransformed);
      }
      else if ($saType === "range") {
        $saTransformed = $fProcessRange($saTransformed);
      }
    }
  }
  return $saPrefix . "" . $saTransformed . "" . $saSuffix;
};
