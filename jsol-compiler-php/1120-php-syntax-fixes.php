<?php
// @JSOL v0.2.97 - PHP Syntax Fixes (Isolated String Manipulations)
$saPhp_StripDeclarations = function($saCode) {
  $saRes = $saCode;
	$aPrefixes = ["\n", "\r\n", "\t", " ", "("];
	for ($iP = 0; $iP < 5; $iP = $iP + 1) {
    $saRes = str_replace( $aPrefixes[$iP] . "const ",  $aPrefixes[$iP], $saRes);
		$saRes = str_replace( $aPrefixes[$iP] . "let ",  $aPrefixes[$iP], $saRes);
		$saRes = str_replace( $aPrefixes[$iP] . "var ",  $aPrefixes[$iP], $saRes);
  }
  if (Str::indexOf($saRes,  "const ") === 0) {
    $saRes = mb_substr($saRes,  6,  mb_strlen($saRes, "UTF-8") - 6, "UTF-8");
  }
  if (Str::indexOf($saRes,  "let ") === 0) {
    $saRes = mb_substr($saRes,  4,  mb_strlen($saRes, "UTF-8") - 4, "UTF-8");
  }
  if (Str::indexOf($saRes,  "var ") === 0) {
    $saRes = mb_substr($saRes,  4,  mb_strlen($saRes, "UTF-8") - 4, "UTF-8");
  }
  return $saRes;
};
$saPhp_FixStringConcat = function($saCode) {
  $saRes = $saCode;
	$saRes = Rgx::replace('(__JSOL_(TOKEN|STR|COM)_\\d+__)\\s*\\+',  '$1 .',  $saRes,  'g');
	$saRes = Rgx::replace('\\+\\s*(__JSOL_(TOKEN|STR|COM)_\\d+__)',  '. $1',  $saRes,  'g');
	$saRes = Rgx::replace('(\\$s[A-Za-z0-9_]*)\\s*\\+',  '$1 .',  $saRes,  'g');
	$saRes = Rgx::replace('\\+\\s*(\\$s[A-Za-z0-9_]*)',  '. $1',  $saRes,  'g');
	return $saRes;
};
$saPhp_FixUseReferences = function($saCode) {
  $saResult = $saCode;
	$bFixUse = true;
	$iUseOffset = 0;

	while ($bFixUse === true) {
    $iSearchLen = mb_strlen($saResult, "UTF-8") - $iUseOffset;
		if ($iSearchLen <= 0) {
      $bFixUse = false; continue;
    }
    $saSearchArea = mb_substr($saResult,  $iUseOffset,  $iSearchLen, "UTF-8");
		$iUseRel = Str::indexOf($saSearchArea,  "use (");
		if ($iUseRel === -1) {
      $bFixUse = false; continue;
    }
    $iStart = $iUseOffset + $iUseRel + 5;
		$saTail = mb_substr($saResult,  $iStart,  mb_strlen($saResult, "UTF-8") - $iStart, "UTF-8");
		$iEndRel = Str::indexOf($saTail,  ")");
		$iEnd = $iStart + $iEndRel;

		$saArgs = mb_substr($saResult,  $iStart,  $iEnd - $iStart, "UTF-8");
		$saRefArgs = Rgx::replace("\\$",  "&$",  $saArgs,  "g");
		$saRefArgs = Rgx::replace("&&\\$",  "&$",  $saRefArgs,  "g");

		$saBefore = mb_substr($saResult,  0,  $iStart, "UTF-8");
		$saAfter = mb_substr($saResult,  $iEnd,  mb_strlen($saResult, "UTF-8") - $iEnd, "UTF-8");

		$saResult = $saBefore . "" . $saRefArgs . "" . $saAfter;
		$iUseOffset = $iStart + mb_strlen($saRefArgs, "UTF-8") + 1;
  }
  return $saResult;
};
