<?php
// @JSOL v0.2.95 - Python Brace Stripper
//
// Runs AFTER $sIndentCode, as the LAST structural pass before $sUnmaskSourceCode.
// By this point indentation is already correct (every "{" opened a new indent
// level, every "}" closed one) — the braces themselves are now pure noise for
// Python, which encodes blocks with indentation alone.
//
// What it does:
//   - Deletes every "{" outright (the newline+indent that $sIndentCode put
//     right after it stays — that IS the correct Python indentation).
//   - Deletes every "}", and if a ";" immediately follows (the leftover
//     statement-terminator from a JS-shaped "};"), deletes that too — a bare
//     ";" with nothing before it on its line is a SyntaxError in Python.
//   - If a block turns out to be EMPTY (nothing but whitespace was written
//     between its "{" and matching "}"), inserts "pass" so the resulting
//     Python is still syntactically valid — Python has no empty-block
//     tolerance the way JS/PHP do with a bare "{}".
//
// Usage: standalone first, same discipline as every other piece in this
// pipeline. Do not wire into engine.jsol until validated.

$bIsWhitespaceCharPY = function($sCh) {
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
$sTrimWithPY = function($sVal) use (&$bIsWhitespaceCharPY) {
  $iLen = mb_strlen($sVal, "UTF-8");
    $iStart = 0;
    while ($iStart < $iLen && $bIsWhitespaceCharPY(mb_substr($sVal,  $iStart,  1, "UTF-8")) === true) {
    $iStart = $iStart + 1;
  }
  $iEnd = $iLen;
    while ($iEnd > $iStart && $bIsWhitespaceCharPY(mb_substr($sVal,  $iEnd - 1,  1, "UTF-8")) === true) {
    $iEnd = $iEnd - 1;
  }
  return mb_substr($sVal,  $iStart,  $iEnd - $iStart, "UTF-8");
};
$sStripPythonBraces = function($sIndentedCode, $sIndentUnit) use (&$bIsWhitespaceCharPY, &$sTrimWithPY) {
  $sResult = "";
    $iDepth = 0;
    $i = 0;
    $iLen = mb_strlen($sIndentedCode, "UTF-8");
    $bStartOfLine = true;
    $aOpenPositions = [];

    while ($i < $iLen) {
    $sCh = mb_substr($sIndentedCode,  $i,  1, "UTF-8");

        if ($sCh === "{") {
      $aOpenPositions[] =  mb_strlen($sResult, "UTF-8");
            $iDepth = $iDepth + 1;
            $sResult = $sResult . "\n";
            $bStartOfLine = true;
            $i = $i + 1;
    }
    else if ($sCh === "}") {
      $iContentStart = 0;
            if (count($aOpenPositions) > 0) {
        $iContentStart = $aOpenPositions[count($aOpenPositions) - 1];
                array_pop($aOpenPositions);
      }
      $sSinceOpen = mb_substr($sResult,  $iContentStart,  mb_strlen($sResult, "UTF-8") - $iContentStart, "UTF-8");
            if ($sTrimWithPY($sSinceOpen) === "") {
        for ($iStep = 0; $iStep < $iDepth; $iStep = $iStep + 1) {
          $sResult = $sResult . "" . $sIndentUnit;
        }
        $sResult = $sResult . "pass\n";
      }
      $iDepth = $iDepth - 1;
            $sResult = $sResult . "\n";
            $bStartOfLine = true;
            $i = $i + 1;

            $iPeek = $i;
            while ($iPeek < $iLen && $bIsWhitespaceCharPY(mb_substr($sIndentedCode,  $iPeek,  1, "UTF-8")) === true) {
        $iPeek = $iPeek + 1;
      }
      if ($iPeek < $iLen && mb_substr($sIndentedCode,  $iPeek,  1, "UTF-8") === ";") {
        $i = $iPeek + 1;
      }
    }
    else if ($sCh === "\n") {
      $sResult = $sResult . "\n";
            $bStartOfLine = true;
            $i = $i + 1;
    }
    else if ($bIsWhitespaceCharPY($sCh) === true) {
      if ($bStartOfLine === true) {
        $i = $i + 1;
      }
      else {
        $sResult = $sResult . "" . $sCh;
                $i = $i + 1;
      }
    }
    else {
      if ($bStartOfLine === true) {
        for ($iStep = 0; $iStep < $iDepth; $iStep = $iStep + 1) {
          $sResult = $sResult . "" . $sIndentUnit;
        }
        $bStartOfLine = false;
      }
      $sResult = $sResult . "" . $sCh;
            $i = $i + 1;
    }
  }
  return $sResult;
};
