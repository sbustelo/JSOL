<?php
// @JSOL v0.2.95 - Self-Hosted Brace-to-Indent Formatter (structural pretty-printer)
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
//
// Usage: run standalone against already-compiled JS/PHP/TS output first (before
// wiring it into engine.jsol) to confirm it doesn't change program behavior, only
// layout. Once validated, the natural insertion point is inside $mExecuteCompilationPipeline,
// applied to $sCompiledJS / $sCompiledPHP / $sCompiledTS right before each is passed
// to $sUnmaskSourceCode.

$sRepeatUnit = function($sUnit, $iCount) {
  $sOut = "";
    for ($i = 0; $i < $iCount; $i = $i + 1) {
    $sOut = $sOut . "" . $sUnit;
  }
  return $sOut;
};
$bIsWhitespaceChar = function($sCh) {
  if ($sCh === " ") {
    return true;
  }
  if ($sCh === "\t") {
    return true;
  }
  if ($sCh === "\n") {
    return true;
  }
  if ($sCh === "\r") {
    return true;
  }
  return false;
};
// Trims only trailing whitespace from an accumulated output buffer, so closing
// braces don't inherit blank lines or dangling spaces left over from the source's
// own (irrelevant, about to be discarded) original formatting.
$sRTrimBuffer = function($sBuf) use (&$bIsWhitespaceChar) {
  $iEnd = mb_strlen($sBuf, "UTF-8");
    while ($iEnd > 0 && $bIsWhitespaceChar(mb_substr($sBuf,  $iEnd - 1,  1, "UTF-8")) === true) {
    $iEnd = $iEnd - 1;
  }
  return mb_substr($sBuf,  0,  $iEnd, "UTF-8");
};
$sIndentCode = function($sMaskedCode, $sIndentUnit) use (&$sRepeatUnit, &$bIsWhitespaceChar, &$sRTrimBuffer) {
  $sResult = "";
    $iDepth = 0;
    $i = 0;
    $iLen = mb_strlen($sMaskedCode, "UTF-8");

    while ($i < $iLen) {
    $sChar = mb_substr($sMaskedCode,  $i,  1, "UTF-8");

        if ($sChar === "{") {
      $iDepth = $iDepth + 1;
            $sResult = $sResult . "" . "{" . "\n" . $sRepeatUnit($sIndentUnit, $iDepth);
            $i = $i + 1;

            // Swallow whatever whitespace the original source had right after "{" —
            // we just emitted our own newline+indent, so any of it left over would
            // only produce blank lines.
            $bSkipping = true;
            while ($i < $iLen && $bSkipping === true) {
        if ($bIsWhitespaceChar(mb_substr($sMaskedCode,  $i,  1, "UTF-8")) === true) {
          $i = $i + 1;
        }
        else {
          $bSkipping = false;
        }
      }
    }
    else if ($sChar === "}") {
      $iDepth = $iDepth - 1;
            $sResult = $sRTrimBuffer($sResult) . "\n" . $sRepeatUnit($sIndentUnit, $iDepth) . "" . "}";
            $i = $i + 1;

            // Swallow whitespace right after "}" before deciding what comes next —
            // same reasoning as after "{": the original spacing is irrelevant, we
            // only care about the next real character.
            $bSkippingAfter = true;
            while ($i < $iLen && $bSkippingAfter === true) {
        if ($bIsWhitespaceChar(mb_substr($sMaskedCode,  $i,  1, "UTF-8")) === true) {
          $i = $i + 1;
        }
        else {
          $bSkippingAfter = false;
        }
      }
      // A ";" immediately following a block close (e.g. "const $mFn = function(){...};")
            // is not a new statement, it's the terminator of THIS one. Glue it onto the
            // same line as "}" instead of stranding it alone on the next line.
            if ($i < $iLen && mb_substr($sMaskedCode,  $i,  1, "UTF-8") === ";") {
        $sResult = $sResult . "" . ";";
                $i = $i + 1;

                $bSkippingAfterSemi = true;
                while ($i < $iLen && $bSkippingAfterSemi === true) {
          if ($bIsWhitespaceChar(mb_substr($sMaskedCode,  $i,  1, "UTF-8")) === true) {
            $i = $i + 1;
          }
          else {
            $bSkippingAfterSemi = false;
          }
        }
      }
      $sResult = $sResult . "\n" . $sRepeatUnit($sIndentUnit, $iDepth);
    }
    else {
      $sResult = $sResult . "" . $sChar;
            $i = $i + 1;
    }
  }
  return $sResult;
};
