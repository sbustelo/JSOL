<?php
// @JSOL v0.2.97 - Python Brace Stripper
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


$bIsWhitespaceCharPY = function($saCh) {
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
$saTrimWithPY = function($saVal) use (&$bIsWhitespaceCharPY) {
  $iLen = mb_strlen($saVal, "UTF-8");
    $iStart = 0;
    while ($iStart < $iLen && $bIsWhitespaceCharPY(mb_substr($saVal,  $iStart,  1, "UTF-8")) === true) {
    $iStart = $iStart + 1;
  }
  $iEnd = $iLen;
    while ($iEnd > $iStart && $bIsWhitespaceCharPY(mb_substr($saVal,  $iEnd - 1,  1, "UTF-8")) === true) {
    $iEnd = $iEnd - 1;
  }
  return mb_substr($saVal,  $iStart,  $iEnd - $iStart, "UTF-8");
};
$saStripPythonBraces = function($saIndentedCode, $saIndentUnit) use (&$bIsWhitespaceCharPY, &$saTrimWithPY) {
  $saResult = "";
    $iDepth = 0;
    $i = 0;
    $iLen = mb_strlen($saIndentedCode, "UTF-8");
    $bStartOfLine = true;
    $aOpenPositions = [];

    while ($i < $iLen) {
    $saCh = mb_substr($saIndentedCode,  $i,  1, "UTF-8");

        if ($saCh === "{") {
      $aOpenPositions[] =  mb_strlen($saResult, "UTF-8");
            $iDepth = $iDepth + 1;
            $saResult = $saResult . "\n";
            $bStartOfLine = true;
            $i = $i + 1;
    }
    else if ($saCh === "}") {
      $iContentStart = 0;
            if (count($aOpenPositions) > 0) {
        $iContentStart = $aOpenPositions[count($aOpenPositions) - 1];
                Arr::pop($aOpenPositions);
      }
      $saSinceOpen = mb_substr($saResult,  $iContentStart,  mb_strlen($saResult, "UTF-8") - $iContentStart, "UTF-8");
            if ($saTrimWithPY($saSinceOpen) === "") {
        for ($iStep = 0; $iStep < $iDepth; $iStep = $iStep + 1) {
          $saResult = $saResult . "" . $saIndentUnit;
        }
        $saResult = $saResult . "pass\n";
      }
      $iDepth = $iDepth - 1;
            $saResult = $saResult . "\n";
            $bStartOfLine = true;
            $i = $i + 1;

            $iPeek = $i;
            while ($iPeek < $iLen && $bIsWhitespaceCharPY(mb_substr($saIndentedCode,  $iPeek,  1, "UTF-8")) === true) {
        $iPeek = $iPeek + 1;
      }
      if ($iPeek < $iLen && mb_substr($saIndentedCode,  $iPeek,  1, "UTF-8") === ";") {
        $i = $iPeek + 1;
      }
    }
    else if ($saCh === "\n") {
      $saResult = $saResult . "\n";
            $bStartOfLine = true;
            $i = $i + 1;
    }
    else if ($bIsWhitespaceCharPY($saCh) === true) {
      if ($bStartOfLine === true) {
        $i = $i + 1;
      }
      else {
        $saResult = $saResult . "" . $saCh;
                $i = $i + 1;
      }
    }
    else {
      if ($bStartOfLine === true) {
        for ($iStep = 0; $iStep < $iDepth; $iStep = $iStep + 1) {
          $saResult = $saResult . "" . $saIndentUnit;
        }
        $bStartOfLine = false;
      }
      $saResult = $saResult . "" . $saCh;
            $i = $i + 1;
    }
  }
  return $saResult;
};
