<?php
// @JSOL v0.2.97 - PHP Use Clause Extractor (Flat Cyclomatic Complexity)
$bPhp_IsIdentChar = function ($saCh) {
  if ($saCh === "$") {
    return true;
  }
  if ($saCh >= "a" && $saCh <= "z") {
    return true;
  }
  if ($saCh >= "A" && $saCh <= "Z") {
    return true;
  }
  if ($saCh >= "0" && $saCh <= "9") {
    return true;
  }
  return false;
};
$mPhp_ReadWord = function($saCode, $iStart) use (&$bPhp_IsIdentChar) {
  $iLen = mb_strlen($saCode, "UTF-8");
	$i = $iStart;
	while ($i < $iLen && $bPhp_IsIdentChar(mb_substr($saCode,  $i,  1, "UTF-8"))) {
    $i = $i + 1;
  }
  return JSOL::dict("word",  mb_substr($saCode,  $iStart,  $i - $iStart, "UTF-8"),  "end",  $i);
};
$aPhp_ExtractVars = function($saText) use (&$mPhp_ReadWord) {
  $aVars = [];
	$i = 0;
	$iLen = mb_strlen($saText, "UTF-8");
	while ($i < $iLen) {
    if (mb_substr($saText,  $i,  1, "UTF-8") === "$") {
      $mWord = $mPhp_ReadWord($saText, $i);
			if ($mWord["word"] !== '$_') {
        $aVars[] =  $mWord["word"];
      }
      $i = $mWord["end"];
    }
    else {
      $i = $i + 1;
    }
  }
  return $aVars;
};
$aPhp_ExtractLocals = function($saBody) use (&$mPhp_ReadWord, &$aPhp_ExtractVars, &$iComp_FindCloseParen, &$bPhp_IsIdentChar) {
  $aLocals = [];
	$i = 0;
	$iLen = mb_strlen($saBody, "UTF-8");
	
	while ($i < $iLen) {
    $bIsFunc = mb_substr($saBody,  $i,  8, "UTF-8") === "function";
		if ($bIsFunc === true && !$bPhp_IsIdentChar(mb_substr($saBody,  $i + 8,  1, "UTF-8"))) {
      $iParen = $i + 8;
			while ($iParen < $iLen && mb_substr($saBody,  $iParen,  1, "UTF-8") !== "(") {
        $iParen = $iParen + 1;
      }
      if ($iParen < $iLen) {
        $iPClose = $iComp_FindCloseParen($saBody, $iParen);
				if ($iPClose !== -1) {
          $saInnerParams = mb_substr($saBody,  $iParen + 1,  $iPClose - $iParen - 1, "UTF-8");
					$aInnerVars = $aPhp_ExtractVars($saInnerParams);
					$iICount = count($aInnerVars);
					for ($iK = 0; $iK < $iICount; $iK = $iK + 1) {
            $aLocals[] =  $aInnerVars[$iK];
          }
        }
      }
      $i = $i + 8; continue;
    }
    $bIsDecl = false;
		$iAfterDecl = $i;
		if (mb_substr($saBody,  $i,  6, "UTF-8") === "const ") {
      $bIsDecl = true; $iAfterDecl = $i + 6;
    }
    else if (mb_substr($saBody,  $i,  4, "UTF-8") === "let ") {
      $bIsDecl = true; $iAfterDecl = $i + 4;
    }
    if ($bIsDecl === true) {
      while ($iAfterDecl < $iLen && (mb_substr($saBody,  $iAfterDecl,  1, "UTF-8") === " " || mb_substr($saBody,  $iAfterDecl,  1, "UTF-8") === "\n" || mb_substr($saBody,  $iAfterDecl,  1, "UTF-8") === "\r" || mb_substr($saBody,  $iAfterDecl,  1, "UTF-8") === "\t")) {
        $iAfterDecl = $iAfterDecl + 1;
      }
      if (mb_substr($saBody,  $iAfterDecl,  1, "UTF-8") === "$") {
        $mWord = $mPhp_ReadWord($saBody, $iAfterDecl);
				$aLocals[] =  $mWord["word"];
      }
      $i = $iAfterDecl; continue;
    }
    $i = $i + 1;
  }
  return $aLocals;
};
$mPhp_AnalyzeClosure = function($saCode, $iFuncStart) use (&$iComp_FindCloseParen, &$iComp_FindCloseBrace, &$aPhp_ExtractVars, &$aPhp_ExtractLocals) {
  $iParenOpen = $iFuncStart + 8;
	$iLen = mb_strlen($saCode, "UTF-8");
	while ($iParenOpen < $iLen && mb_substr($saCode,  $iParenOpen,  1, "UTF-8") !== "(" && mb_substr($saCode,  $iParenOpen,  1, "UTF-8") !== "{") {
    $iParenOpen = $iParenOpen + 1;
  }
  if ($iParenOpen >= $iLen || mb_substr($saCode,  $iParenOpen,  1, "UTF-8") !== "(") {
    return JSOL::dict("valid",  false);
  }
  $iParenClose = $iComp_FindCloseParen($saCode, $iParenOpen);
	if ($iParenClose === -1) {
    return JSOL::dict("valid",  false);
  }
  $iBraceOpen = $iParenClose + 1;
	while ($iBraceOpen < $iLen && mb_substr($saCode,  $iBraceOpen,  1, "UTF-8") !== "{" && mb_substr($saCode,  $iBraceOpen,  1, "UTF-8") !== "(") {
    $iBraceOpen = $iBraceOpen + 1;
  }
  if ($iBraceOpen >= $iLen || mb_substr($saCode,  $iBraceOpen,  1, "UTF-8") !== "{") {
    return JSOL::dict("valid",  false);
  }
  $iBraceClose = $iComp_FindCloseBrace($saCode, $iBraceOpen);
	if ($iBraceClose === -1) {
    return JSOL::dict("valid",  false);
  }
  $saParamsStr = mb_substr($saCode,  $iParenOpen + 1,  $iParenClose - $iParenOpen - 1, "UTF-8");
	$saBody = mb_substr($saCode,  $iParenOpen + 1,  $iBraceClose - $iParenOpen - 1, "UTF-8");

	if (Str::indexOf($saBody,  "JSOL.use") !== -1) {
    return JSOL::dict("valid",  false);
  }
  $aParams = $aPhp_ExtractVars($saParamsStr);
	$aAllVars = $aPhp_ExtractVars($saBody);
	$aLocals = $aPhp_ExtractLocals($saBody);

	$aFree = [];
	$iAllCount = count($aAllVars);
	for ($iV = 0; $iV < $iAllCount; $iV = $iV + 1) {
    $saVar = $aAllVars[$iV];
		if (Arr::indexOf($aParams,  $saVar) === -1 && Arr::indexOf($aLocals,  $saVar) === -1 && Arr::indexOf($aFree,  $saVar) === -1) {
      $aFree[] =  $saVar;
    }
  }
  return JSOL::dict("valid",  true,  "free",  $aFree,  "parenClose",  $iParenClose);
};
$saExtractPHPUse = function($saCode) use (&$bPhp_IsIdentChar, &$mPhp_AnalyzeClosure) {
  $saResult = $saCode;
	$iFunc = mb_strlen($saResult, "UTF-8") - 8;

	while ($iFunc >= 0) {
    if (mb_substr($saResult,  $iFunc,  8, "UTF-8") !== "function") {
      $iFunc = $iFunc - 1; continue;
    }
    $bPrev = $iFunc === 0 || !$bPhp_IsIdentChar(mb_substr($saResult,  $iFunc - 1,  1, "UTF-8"));
		$bNext = $iFunc + 8 === mb_strlen($saResult, "UTF-8") || !$bPhp_IsIdentChar(mb_substr($saResult,  $iFunc + 8,  1, "UTF-8"));
		if (!$bPrev || !$bNext) {
      $iFunc = $iFunc - 1; continue;
    }
    $mAnalysis = $mPhp_AnalyzeClosure($saResult, $iFunc);
		if ($mAnalysis["valid"] === true) {
      $aFree = $mAnalysis["free"];
			if (count($aFree) > 0) {
        $aRefFree = [];
				$iFreeCount = count($aFree);
				for ($iF = 0; $iF < $iFreeCount; $iF = $iF + 1) {
          $aRefFree[] =  "&$" . mb_substr($aFree[$iF],  1,  mb_strlen($aFree[$iF], "UTF-8") - 1, "UTF-8");
        }
        $saUseClause = " use (" . implode( ", ", $aRefFree) . ")";
				$iParenClose = $mAnalysis["parenClose"];
				$saBefore = mb_substr($saResult,  0,  $iParenClose + 1, "UTF-8");
				$saAfter = mb_substr($saResult,  $iParenClose + 1,  mb_strlen($saResult, "UTF-8") - ($iParenClose + 1), "UTF-8");
				$saResult = $saBefore . "" . $saUseClause . "" . $saAfter;
      }
    }
    $iFunc = $iFunc - 1;
  }
  return $saResult;
};
