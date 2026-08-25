<?php
// @JSOL v0.2.96 - CLI Arguments Parser (generic, target-agnostic)
//
// No target id is hardcoded here. Any "--<id>-target=", "--<id>-prefix=",
// "--<id>-suffix=" flag is parsed generically into $mOptions[id + "Target"/
// "Prefix"/"Suffix"], for ANY id — adding a new compiler target never
// requires touching this file again.

$bEndsWith = function ($sStr, $sSuffix) {
  $iStrLen = mb_strlen($sStr, "UTF-8");
	$iSufLen = mb_strlen($sSuffix, "UTF-8");
	if ($iSufLen > $iStrLen) {
    return false;
  }
  return mb_substr($sStr,  $iStrLen - $iSufLen,  $iSufLen, "UTF-8") === $sSuffix;
};
// The ONLY place "py" gets normalized to "python" in the whole compiler.
// "python" is canonical everywhere else (matches targets/python/rules.json,
// $mSSOT["targets"]["python"], $mBackendRegistry). "py" survives only as the
// CLI's short spelling and the output file extension (handled elsewhere).
$sNormalizeTargetId = function ($sId) {
  if ($sId === "py") {
    return "python";
  }
  return $sId;
};
$mParseRawCliArgs = function($aRawArgs) use (&$bEndsWith, &$sNormalizeTargetId) {
  $mOptions = JSOL::dict(
		"source",  "", 
		"sourceDir",  "", 
		"outDir",  "", 
		"target",  "", 
		"targets",  ""
	);

	$iCount = count($aRawArgs);
	for ($i = 0; $i < $iCount; $i = $i + 1) {
    $sArg = $aRawArgs[$i];
		$bIsFlag = (JSOL::strIndexOf($sArg,  "--") === 0);

		if ($bIsFlag === true) {
      $sClean = mb_substr($sArg,  2,  mb_strlen($sArg, "UTF-8") - 2, "UTF-8");
			$iEqIndex = JSOL::strIndexOf($sClean,  "=");
			$sKey = "";
			$sVal = "";

			if ($iEqIndex !== -1) {
        $sKey = mb_substr($sClean,  0,  $iEqIndex, "UTF-8");
				$sVal = mb_substr($sClean,  $iEqIndex + 1,  mb_strlen($sClean, "UTF-8") - ($iEqIndex + 1), "UTF-8");
      }
      else {
        $sKey = $sClean;
				$sVal = "true";
      }
      if ($sKey === "source") {
        $mOptions["source"] = $sVal;
      }
      else if ($sKey === "source-dir") {
        $mOptions["sourceDir"] = $sVal;
      }
      else if ($sKey === "out-dir") {
        $mOptions["outDir"] = $sVal;
      }
      else if ($sKey === "targets") {
        $mOptions["targets"] = $sVal;
      }
      else if ($sKey === "target") {
        $mOptions["target"] = $sVal;
      }
      else if ($bEndsWith($sKey, "-target") === true) {
        $sRawId = mb_substr($sKey,  0,  mb_strlen($sKey, "UTF-8") - 7, "UTF-8");
				$sId = $sNormalizeTargetId($sRawId);
				$mOptions[$sId . "" . "Target"] = $sVal;
      }
      else if ($bEndsWith($sKey, "-prefix") === true) {
        $sRawId = mb_substr($sKey,  0,  mb_strlen($sKey, "UTF-8") - 7, "UTF-8");
				$sId = $sNormalizeTargetId($sRawId);
				$mOptions[$sId . "" . "Prefix"] = $sVal;
      }
      else if ($bEndsWith($sKey, "-suffix") === true) {
        $sRawId = mb_substr($sKey,  0,  mb_strlen($sKey, "UTF-8") - 7, "UTF-8");
				$sId = $sNormalizeTargetId($sRawId);
				$mOptions[$sId . "" . "Suffix"] = $sVal;
      }
    }
  }
  return $mOptions;
};
