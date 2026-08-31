<?php
// @JSOL v0.2.97 - Self-Hosted Brace-to-Indent Formatter (structural pretty-printer)
//
// Operates on MASKED code (strings/comments already replaced by __JSOL_STR_N__ /
// __JSOL_COM_N__ tokens by lexer.jsol), BEFORE $sUnmaskSourceCode runs.
//
// Because JSOL forbids raw object literals at the source level (dicts are always
// Map.create(...)), every "{" and "}" that survives compilation into masked target
// code is a genuine block delimiter: function bodies, if/for/while, JSOL.JS/JSOL.PHP.
// There is no case where a brace means anything else, so counting depth doubles as
// an unambiguous indentation oracle with zero risk of mistaking an object-literal
// brace for a block brace.
//
// Scope, deliberately: this pass only inserts structure around "{" and "}". It does
// NOT split multiple ";"-terminated statements that already share a line in the
// compiler's dense output. That's a separate, later decision, not part of this pass.


$saInd_RepeatUnit = function($saUnit, $iCount) {
  $saOut = "";
    for ($i = 0; $i < $iCount; $i = $i + 1) {
    $saOut = Str::concat($saOut,  $saUnit);
  }
  return $saOut;
};
$bInd_IsWhitespace = function($saCh) {
  return $saCh === " " || $saCh === "\t" || $saCh === "\n" || $saCh === "\r";
};
$saInd_RTrimBuffer = function($saBuf) use (&$bInd_IsWhitespace) {
  $iEnd = mb_strlen($saBuf, "UTF-8");
    while ($iEnd > 0 && $bInd_IsWhitespace(mb_substr($saBuf,  $iEnd - 1,  1, "UTF-8")) === true) {
    $iEnd = $iEnd - 1;
  }
  return mb_substr($saBuf,  0,  $iEnd, "UTF-8");
};
$iInd_SkipWhitespace = function($saCode, $iStart, $iLen) use (&$bInd_IsWhitespace) {
  $i = $iStart;
    while ($i < $iLen && $bInd_IsWhitespace(mb_substr($saCode,  $i,  1, "UTF-8")) === true) {
    $i = $i + 1;
  }
  return $i;
};
$saIndentCode = function($saMaskedCode, $saIndentUnit) use (&$saInd_RepeatUnit, &$saInd_RTrimBuffer, &$iInd_SkipWhitespace) {
  $saResult = "";
    $iDepth = 0;
    $i = 0;
    $iLen = mb_strlen($saMaskedCode, "UTF-8");

    while ($i < $iLen) {
    $saChar = mb_substr($saMaskedCode,  $i,  1, "UTF-8");

        if ($saChar === "{") {
      $iDepth = $iDepth + 1;
            $saResult = Str::concat($saResult,  "{\n",  $saInd_RepeatUnit($saIndentUnit, $iDepth));
            $i = $iInd_SkipWhitespace($saMaskedCode, $i + 1, $iLen);
    }
    else if ($saChar === "}") {
      $iDepth = $iDepth - 1;
            $saResult = Str::concat($saInd_RTrimBuffer($saResult),  "\n",  $saInd_RepeatUnit($saIndentUnit, $iDepth),  "}");
            $i = $iInd_SkipWhitespace($saMaskedCode, $i + 1, $iLen);
            
            if ($i < $iLen && mb_substr($saMaskedCode,  $i,  1, "UTF-8") === ";") {
        $saResult = Str::concat($saResult,  ";");
                $i = $iInd_SkipWhitespace($saMaskedCode, $i + 1, $iLen);
      }
      $saResult = Str::concat($saResult,  "\n",  $saInd_RepeatUnit($saIndentUnit, $iDepth));
    }
    else {
      $saResult = Str::concat($saResult,  $saChar);
            $i = $i + 1;
    }
  }
  return $saResult;
};
