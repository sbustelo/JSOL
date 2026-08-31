<?php
// @JSOL v0.2.97
$fProcessParams = function($saCode) use (&$iComp_FindCloseParen) {
  $saResult = $saCode;
	$bContinue = true;
	$iOffset = 0;

	while ($bContinue === true) {
    $iSearchLen = mb_strlen($saResult, "UTF-8") - $iOffset;
		if ($iSearchLen <= 0) {
      $bContinue = false; continue;
    }
    $saSearchArea = mb_substr($saResult,  $iOffset,  $iSearchLen, "UTF-8");
		$iRelIdx = Str::indexOf($saSearchArea,  "function");
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    $iStartIdx = $iOffset + $iRelIdx;
		$iParenScan = $iStartIdx + 8;
		$iRLen = mb_strlen($saResult, "UTF-8");

		while ($iParenScan < $iRLen && (mb_substr($saResult,  $iParenScan,  1, "UTF-8") === " " || mb_substr($saResult,  $iParenScan,  1, "UTF-8") === "\t" || mb_substr($saResult,  $iParenScan,  1, "UTF-8") === "\n" || mb_substr($saResult,  $iParenScan,  1, "UTF-8") === "\r")) {
      $iParenScan = $iParenScan + 1;
    }
    if ($iParenScan >= $iRLen || mb_substr($saResult,  $iParenScan,  1, "UTF-8") !== "(") {
      $iOffset = $iStartIdx + 8;
			continue;
    }
    $iCloseParen = $iComp_FindCloseParen($saResult, $iParenScan);
		if ($iCloseParen === -1) {
      $bContinue = false; continue;
    }
    $saRawParams = mb_substr($saResult,  $iParenScan + 1,  $iCloseParen - $iParenScan - 1, "UTF-8");
		$saTrimmedParams = trim($saRawParams);
		$saTypedParams = "";

		if (mb_strlen($saTrimmedParams, "UTF-8") > 0) {
      $aParts = Str::split($saTrimmedParams,  ",");
			$iPartsCount = count($aParts);
			$aTypedParts = [];
			for ($iP = 0; $iP < $iPartsCount; $iP = $iP + 1) {
        $saRawPart = trim($aParts[$iP]);
				$saTypedPart = $saRawPart;
				if (mb_strlen($saRawPart, "UTF-8") > 0 && Str::indexOf($saRawPart,  ":") === -1) {
          $saTypedPart = $saRawPart . ": any";
        }
        $aTypedParts[] =  $saTypedPart;
      }
      $saTypedParams = implode( ", ", $aTypedParts);
    }
    $saBefore = mb_substr($saResult,  0,  $iParenScan + 1, "UTF-8");
		$saAfter = mb_substr($saResult,  $iCloseParen,  mb_strlen($saResult, "UTF-8") - $iCloseParen, "UTF-8");

		$saResult = $saBefore . "" . $saTypedParams . "" . $saAfter;
		$iOffset = $iParenScan + 1 + mb_strlen($saTypedParams, "UTF-8") + 1;
  }
  return $saResult;
};
