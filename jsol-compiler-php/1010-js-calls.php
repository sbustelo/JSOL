<?php
// @JSOL v0.2.97 - Blind Router for Function Calls (Agnostic SSOT Consumer)

$sResolveShadowMap = function($saTemplate, $aArgs, $saMetaShadowRef) use (&$bIsLinterWordChar) {
  $sResult = $saTemplate;
	$bContinue = true;

	while ($bContinue === true) {
    $iRelIdx = Str::indexOf($sResult,  "{shadowMap:");
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    $iStartIdx = $iRelIdx;
		$iEndIdx = Str::indexOf(mb_substr($sResult,  $iStartIdx,  mb_strlen($sResult, "UTF-8") - $iStartIdx, "UTF-8"),  "}") + $iStartIdx;

		if ($iEndIdx === $iStartIdx - 1) {
      $bContinue = false; continue;
    }
    $saArgIndexStr = mb_substr($sResult,  $iStartIdx + 11,  $iEndIdx - ($iStartIdx + 11), "UTF-8");
		$iArgIdx = Cast::toInt($saArgIndexStr);
		$saArgValue = $aArgs[$iArgIdx];

		$sRoot = "";
		$iScan = 0;
		if (mb_substr($saArgValue,  0,  1, "UTF-8") === "$") {
      $iScan = 1;
			while ($iScan < mb_strlen($saArgValue, "UTF-8")) {
        $sC = mb_substr($saArgValue,  $iScan,  1, "UTF-8");
				if ($sC === "_") {
          $iScan = $iScan + 1;
					break;
        }
        if ($sC >= "A" && $sC <= "Z") {
          break;
        }
        $iScan = $iScan + 1;
      }
      $sRoot = mb_substr($saArgValue,  $iScan,  mb_strlen($saArgValue, "UTF-8") - $iScan, "UTF-8");
    }
    else {
      $sClean = str_replace( "\"",  "", $saArgValue);
			$sRoot = str_replace( "'",  "", $sClean);
    }
    $sRoot = mb_strtolower($sRoot, "UTF-8");
		
		$saShadowRef = str_replace( "{root}",  $sRoot, $saMetaShadowRef);

		$saBefore = mb_substr($sResult,  0,  $iStartIdx, "UTF-8");
		$saAfter = mb_substr($sResult,  $iEndIdx + 1,  mb_strlen($sResult, "UTF-8") - ($iEndIdx + 1), "UTF-8");
		$sResult = $saBefore . "" . $saShadowRef . "" . $saAfter;
  }
  return $sResult;
};
$fProcessCall = function($saCode, $saKeyword, $saTemplate, $saMetaShadowRef) use (&$mComp_ParseArgs, &$sResolveShadowMap) {
  $saResult = $saCode;
	$bContinue = true;
	$iOffset = 0;

	while ($bContinue === true) {
    $iSearchLen = mb_strlen($saResult, "UTF-8") - $iOffset;
		if ($iSearchLen <= 0) {
      $bContinue = false; continue;
    }
    $saSearchArea = mb_substr($saResult,  $iOffset,  $iSearchLen, "UTF-8");
		$iRelIdx = Str::indexOf($saSearchArea,  $saKeyword);
		if ($iRelIdx === -1) {
      $bContinue = false; continue;
    }
    $iStartIdx = $iOffset + $iRelIdx;
		$iOpenParen = $iStartIdx + mb_strlen($saKeyword, "UTF-8") - 1;
		
		$mData = $mComp_ParseArgs($saResult, $iOpenParen);
		if ($mData["close"] === -1) {
      $bContinue = false; continue;
    }
    $saBefore = mb_substr($saResult,  0,  $iStartIdx, "UTF-8");
		$saAfter = mb_substr($saResult,  $mData["close"] + 1,  mb_strlen($saResult, "UTF-8") - $mData["close"] - 1, "UTF-8");
		$aArgs = $mData["args"];
		
		$saRep = $saTemplate;

		if (Str::indexOf($saRep,  "{shadowMap:") !== -1 && $saMetaShadowRef !== "") {
      $saRep = $sResolveShadowMap($saRep, $aArgs, $saMetaShadowRef);
    }
    if (Str::indexOf($saRep,  "{*}") !== -1) {
      $saRep = str_replace( "{*}",  implode( ", ", $aArgs), $saRep);
    }
    else {
      $iArgsCount = count($aArgs);
			for ($iK = 0; $iK < $iArgsCount; $iK = $iK + 1) {
        $saPlaceholder = Str::concat("{",  $iK,  "}");
				$saRep = str_replace( $saPlaceholder,  $aArgs[$iK], $saRep);
      }
    }
    $saResult = $saBefore . "" . $saRep . "" . $saAfter;
		$iOffset = $iStartIdx + 1;
  }
  return $saResult;
};
