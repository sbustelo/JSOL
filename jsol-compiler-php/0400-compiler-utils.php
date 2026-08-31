<?php
// @JSOL v0.2.97 - AST-Free Global Utilities (1/2)

$bComp_IsWordChar = function($saCh) {
  if ($saCh === "") {
    return false;
  }
  $iCode = mb_ord(mb_substr($saCh,  0, 1, "UTF-8"), "UTF-8");
    if ($iCode >= 48 && $iCode <= 57) {
    return true;
  }
  if ($iCode >= 65 && $iCode <= 90) {
    return true;
  }
  if ($iCode >= 97 && $iCode <= 122) {
    return true;
  }
  if ($iCode === 95) {
    return true;
  }
  return false;
};
$mComp_ParseArgs = function($saCode, $iOpenParen) {
  $iParenCount = 1;
    $iBracketCount = 0;
    $iBraceCount = 0;
    $bInStr = false;
    $iCloseParen = -1;
    $aArgs = [];
    $iCurrentArgStart = $iOpenParen + 1;
    $iRLen = mb_strlen($saCode, "UTF-8");

    for ($i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
    $saChar = mb_substr($saCode,  $i,  1, "UTF-8");
        $saPrev = mb_substr($saCode,  $i - 1,  1, "UTF-8");
        if ($saChar === "\"" && $saPrev !== "\\") {
      $bInStr = !$bInStr;
    }
    if ($bInStr === false) {
      if ($saChar === "(") {
        $iParenCount = $iParenCount + 1;
      }
      if ($saChar === ")") {
        $iParenCount = $iParenCount - 1;
      }
      if ($saChar === "[") {
        $iBracketCount = $iBracketCount + 1;
      }
      if ($saChar === "]") {
        $iBracketCount = $iBracketCount - 1;
      }
      if ($saChar === "{") {
        $iBraceCount = $iBraceCount + 1;
      }
      if ($saChar === "}") {
        $iBraceCount = $iBraceCount - 1;
      }
    }
    if ($saChar === "," && $iParenCount === 1 && $iBracketCount === 0 && $iBraceCount === 0 && $bInStr === false) {
      $aArgs[] =  mb_substr($saCode,  $iCurrentArgStart,  $i - $iCurrentArgStart, "UTF-8");
            $iCurrentArgStart = $i + 1;
    }
    else if ($iParenCount === 0) {
      $aArgs[] =  mb_substr($saCode,  $iCurrentArgStart,  $i - $iCurrentArgStart, "UTF-8");
            $iCloseParen = $i;
            break;
    }
  }
  return JSOL::dict("close",  $iCloseParen,  "args",  $aArgs);
};
$iComp_FindCloseBrace = function($saCode, $iOpenBrace) {
  $iBraceCount = 1;
    $iRLen = mb_strlen($saCode, "UTF-8");
    for ($i = $iOpenBrace + 1; $i < $iRLen; $i = $i + 1) {
    $saChar = mb_substr($saCode,  $i,  1, "UTF-8");
        if ($saChar === "{") {
      $iBraceCount = $iBraceCount + 1;
    }
    if ($saChar === "}") {
      $iBraceCount = $iBraceCount - 1;
    }
    if ($iBraceCount === 0) {
      return $i;
    }
  }
  return -1;
};
$iComp_FindCloseParen = function($saCode, $iOpenParen) {
  $iParenCount = 1;
    $iRLen = mb_strlen($saCode, "UTF-8");
    for ($i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
    $saChar = mb_substr($saCode,  $i,  1, "UTF-8");
        if ($saChar === "(") {
      $iParenCount = $iParenCount + 1;
    }
    if ($saChar === ")") {
      $iParenCount = $iParenCount - 1;
    }
    if ($iParenCount === 0) {
      return $i;
    }
  }
  return -1;
};
$iComp_FindStmtEnd = function($saCode, $iStart) {
  $iRLen = mb_strlen($saCode, "UTF-8");
    $iEndIdx = $iStart;
    $bFindingEnd = true;
    while ($iEndIdx < $iRLen && $bFindingEnd === true) {
    $saChar = mb_substr($saCode,  $iEndIdx,  1, "UTF-8");
        if ($saChar === " " || $saChar === "\n" || $saChar === "\r" || $saChar === ")" || $saChar === ";") {
      $iEndIdx = $iEndIdx + 1;
    }
    else {
      $bFindingEnd = false;
    }
  }
  return $iEndIdx;
};
