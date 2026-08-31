<?php
// @JSOL v0.2.97 - Python Compiler Utilities
$bIsWhitespaceCharTrim = function($saCh) {
  if ($saCh === " ") {
    return true;
  }
  if ($saCh === "\t") {
    return true;
  }
  if ($saCh === "\n") {
    return true;
  }
  if ($saCh === "\r") {
    return true;
  }
  return false;
};
$saTrimWhitespace = function($saVal) use (&$bIsWhitespaceCharTrim) {
  $iLen = mb_strlen($saVal, "UTF-8");
    $iStart = 0;
    while ($iStart < $iLen && $bIsWhitespaceCharTrim(mb_substr($saVal,  $iStart,  1, "UTF-8")) === true) {
    $iStart = $iStart + 1;
  }
  $iEnd = $iLen;
    while ($iEnd > $iStart && $bIsWhitespaceCharTrim(mb_substr($saVal,  $iEnd - 1,  1, "UTF-8")) === true) {
    $iEnd = $iEnd - 1;
  }
  return mb_substr($saVal,  $iStart,  $iEnd - $iStart, "UTF-8");
};
$bIsIdentChar = function($saCh) {
  if ($saCh === "_") {
    return true;
  }
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
$mReadWord = function($saCode, $iStart) use (&$bIsIdentChar) {
  $iLen = mb_strlen($saCode, "UTF-8");
    $i = $iStart;
    while ($i < $iLen && $bIsIdentChar(mb_substr($saCode,  $i,  1, "UTF-8")) === true) {
    $i = $i + 1;
  }
  return JSOL::dict("word",  mb_substr($saCode,  $iStart,  $i - $iStart, "UTF-8"),  "end",  $i);
};
$iSkipWhitespace = function($saCode, $iStart) {
  $iLen = mb_strlen($saCode, "UTF-8");
    $i = $iStart;
    while ($i < $iLen) {
    $saCh = mb_substr($saCode,  $i,  1, "UTF-8");
        if ($saCh === " " || $saCh === "\t" || $saCh === "\n" || $saCh === "\r") {
      $i = $i + 1;
    }
    else {
      return $i;
    }
  }
  return $i;
};
$mReadBalancedParens = function($saCode, $iOpenIndex) {
  $iLen = mb_strlen($saCode, "UTF-8");
    $iDepth = 0;
    $i = $iOpenIndex;
    $iInsideStart = -1;

    while ($i < $iLen) {
    $saCh = mb_substr($saCode,  $i,  1, "UTF-8");
        if ($saCh === "(") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($saCh === ")") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL::dict(
                    "inside",  mb_substr($saCode,  $iInsideStart,  $i - $iInsideStart, "UTF-8"), 
                    "end",  $i + 1
                );
      }
    }
    $i = $i + 1;
  }
  return JSOL::dict("inside",  "",  $iLen);
};
$mReadBalancedBraces = function($saCode, $iOpenIndex) {
  $iLen = mb_strlen($saCode, "UTF-8");
    $iDepth = 0;
    $i = $iOpenIndex;
    $iInsideStart = -1;
    while ($i < $iLen) {
    $saCh = mb_substr($saCode,  $i,  1, "UTF-8");
        if ($saCh === "{") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($saCh === "}") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL::dict("inside",  mb_substr($saCode,  $iInsideStart,  $i - $iInsideStart, "UTF-8"),  "end",  $i + 1);
      }
    }
    $i = $i + 1;
  }
  return JSOL::dict("inside",  "",  $iLen);
};
