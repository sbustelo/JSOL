<?php
// @JSOL v0.2.97 - CLI Arguments Parser (generic, target-agnostic)
//
// No target id is hardcoded here. Any "--<id>-target=", "--<id>-prefix=",
// "--<id>-suffix=" flag is parsed generically into $mOptions[id + "Target"/
// "Prefix"/"Suffix"], for ANY id — adding a new compiler target never
// requires touching this file again.

// Contains the ONLY place "py" gets normalized to "python" in the whole compiler.
// "python" is canonical everywhere else (matches targets/python/rules.json,
// $mSSOT["targets"]["python"], $mBackendRegistry). "py" survives only as the
// CLI's short spelling and the output file extension (handled elsewhere).


$bCli_EndsWith = function ($saStr, $saSuffix) {
  $iStrLen = mb_strlen($saStr, "UTF-8");
	$iSufLen = mb_strlen($saSuffix, "UTF-8");
	if ($iSufLen > $iStrLen) {
    return false;
  }
  return mb_substr($saStr,  $iStrLen - $iSufLen,  $iSufLen, "UTF-8") === $saSuffix;
};
$saCli_NormalizeTargetId = function ($saId) {
  if ($saId === "py") {
    return "python";
  }
  return $saId;
};
$mParseRawCliArgs = function($aRawArgs) use (&$bCli_EndsWith, &$saCli_NormalizeTargetId) {
  $mOptions = JSOL::dict("source",  "",  "sourceDir",  "",  "outDir",  "",  "target",  "",  "targets",  "");
	$iCount = count($aRawArgs);

	for ($i = 0; $i < $iCount; $i = $i + 1) {
    $saArg = $aRawArgs[$i];
		if (Str::indexOf($saArg,  "--") === 0) {
      $saClean = mb_substr($saArg,  2,  mb_strlen($saArg, "UTF-8") - 2, "UTF-8");
			$iEqIndex = Str::indexOf($saClean,  "=");
			$saKey = $saClean;
			$saVal = "true";

			if ($iEqIndex !== -1) {
        $saKey = mb_substr($saClean,  0,  $iEqIndex, "UTF-8");
				$saVal = mb_substr($saClean,  $iEqIndex + 1,  mb_strlen($saClean, "UTF-8") - ($iEqIndex + 1), "UTF-8");
      }
      if ($saKey === "source") {
        $mOptions["source"] = $saVal;
      }
      else if ($saKey === "source-dir") {
        $mOptions["sourceDir"] = $saVal;
      }
      else if ($saKey === "out-dir") {
        $mOptions["outDir"] = $saVal;
      }
      else if ($saKey === "targets") {
        $mOptions["targets"] = $saVal;
      }
      else if ($saKey === "target") {
        $mOptions["target"] = $saVal;
      }
      else if ($bCli_EndsWith($saKey, "-target") === true) {
        $mOptions[Str::concat($saCli_NormalizeTargetId(mb_substr($saKey,  0,  mb_strlen($saKey, "UTF-8") - 7, "UTF-8")),  "Target")] = $saVal;
      }
      else if ($bCli_EndsWith($saKey, "-prefix") === true) {
        $mOptions[Str::concat($saCli_NormalizeTargetId(mb_substr($saKey,  0,  mb_strlen($saKey, "UTF-8") - 7, "UTF-8")),  "Prefix")] = $saVal;
      }
      else if ($bCli_EndsWith($saKey, "-suffix") === true) {
        $mOptions[Str::concat($saCli_NormalizeTargetId(mb_substr($saKey,  0,  mb_strlen($saKey, "UTF-8") - 7, "UTF-8")),  "Suffix")] = $saVal;
      }
    }
  }
  return $mOptions;
};
