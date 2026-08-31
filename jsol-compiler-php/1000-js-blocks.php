<?php
// @JSOL v0.2.97
$fProcessBlock = function($saCode, $saKeyword, $bUnwrap) use (&$iComp_FindCloseBrace, &$iComp_FindStmtEnd) {
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
		$saTail = mb_substr($saResult,  $iStartIdx,  mb_strlen($saResult, "UTF-8") - $iStartIdx, "UTF-8");
		$iRelOpenBrace = Str::indexOf($saTail,  "{");
		
		if ($iRelOpenBrace === -1) {
      $bContinue = false; continue;
    }
    $iOpenBrace = $iStartIdx + $iRelOpenBrace;

		$iCloseBrace = $iComp_FindCloseBrace($saResult, $iOpenBrace);
		if ($iCloseBrace === -1) {
      $bContinue = false; continue;
    }
    $iEndIdx = $iComp_FindStmtEnd($saResult, $iCloseBrace + 1);
		$saBefore = mb_substr($saResult,  0,  $iStartIdx, "UTF-8");
		$saAfter = mb_substr($saResult,  $iEndIdx,  mb_strlen($saResult, "UTF-8") - $iEndIdx, "UTF-8");

		if ($bUnwrap === true) {
      $saInner = mb_substr($saResult,  $iOpenBrace + 1,  $iCloseBrace - $iOpenBrace - 1, "UTF-8");
			$saResult = $saBefore . "" . $saInner . "" . $saAfter;
			$iOffset = mb_strlen($saBefore, "UTF-8") + mb_strlen($saInner, "UTF-8");
    }
    else {
      $saResult = $saBefore . "" . $saAfter;
			$iOffset = mb_strlen($saBefore, "UTF-8");
    }
  }
  return $saResult;
};
