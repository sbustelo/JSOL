<?php
// @JSOL v0.2.97 - Python Translators & Sanitizers
$aTranslateCommentTokensToPython = function($aTokens) {
  $aResult = [];
    for ($i = 0; $i < count($aTokens); $i = $i + 1) {
    $mToken = $aTokens[$i];
        $saKey = $mToken["key"];
        $saVal = $mToken["value"];

        if (mb_substr($saVal,  0,  2, "UTF-8") === "//") {
      $saRest = mb_substr($saVal,  2,  mb_strlen($saVal, "UTF-8") - 2, "UTF-8");
            $aResult[] =  JSOL::dict("key",  $saKey,  "value",  "#" . "" . $saRest);
    }
    else if (mb_substr($saVal,  0,  2, "UTF-8") === "/*") {
      $saInner = mb_substr($saVal,  2,  mb_strlen($saVal, "UTF-8") - 2, "UTF-8");
            if (mb_substr($saInner,  mb_strlen($saInner, "UTF-8") - 2,  2, "UTF-8") === "*/") {
        $saInner = mb_substr($saInner,  0,  mb_strlen($saInner, "UTF-8") - 2, "UTF-8");
      }
      $saConverted = "#" . "" . str_replace( "\n",  "\n#", $saInner);
            $aResult[] =  JSOL::dict("key",  $saKey,  "value",  $saConverted);
    }
    else {
      $aResult[] =  JSOL::dict("key",  $saKey,  "value",  $saVal);
    }
  }
  return $aResult;
};
$saTranslateOperators = function($saExpr) use (&$bIsIdentChar, &$mReadWord) {
  $saResult = "";
    $i = 0;
    $iLen = mb_strlen($saExpr, "UTF-8");

    while ($i < $iLen) {
    $saCh = mb_substr($saExpr,  $i,  1, "UTF-8");
        $bAtBoundary = ($i === 0) || ($bIsIdentChar(mb_substr($saExpr,  $i - 1,  1, "UTF-8")) === false);

        if ($bAtBoundary === true && $bIsIdentChar($saCh) === true) {
      $mWord = $mReadWord($saExpr, $i);
            $saWordStr = $mWord["word"];

            if ($saWordStr === "true") {
        $saResult = $saResult . "" . "True"; $i = $mWord["end"];
      }
      else if ($saWordStr === "false") {
        $saResult = $saResult . "" . "False"; $i = $mWord["end"];
      }
      else if ($saWordStr === "null") {
        $saResult = $saResult . "" . "None"; $i = $mWord["end"];
      }
      else {
        $saResult = $saResult . "" . $saWordStr; $i = $mWord["end"];
      }
    }
    else {
      $saTwo = mb_substr($saExpr,  $i,  2, "UTF-8");
            $saThree = mb_substr($saExpr,  $i,  3, "UTF-8");

            if ($saThree === "===") {
        $saResult = $saResult . "" . "=="; $i = $i + 3;
      }
      else if ($saThree === "!==") {
        $saResult = $saResult . "" . "!="; $i = $i + 3;
      }
      else if ($saTwo === "&&") {
        $saResult = $saResult . "" . "and"; $i = $i + 2;
      }
      else if ($saTwo === "||") {
        $saResult = $saResult . "" . "or"; $i = $i + 2;
      }
      else if ($saTwo === "!=") {
        $saResult = $saResult . "" . "!="; $i = $i + 2;
      }
      else if (mb_substr($saExpr,  $i,  1, "UTF-8") === "!") {
        $saResult = $saResult . "" . "not "; $i = $i + 1;
      }
      else {
        $saResult = $saResult . "" . $saCh; $i = $i + 1;
      }
    }
  }
  return $saResult;
};
$saSanitizePythonIdentifiers = function($saMaskedCode) use (&$bIsIdentChar) {
  $aPyKeywords = [
        "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", 
        "continue", "def", "del", "elif", "else", "except", "finally", "for", "from", "global", 
        "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
        "try", "while", "with", "yield"
    ];
    $aPyBuiltins = [
        "str", "int", "float", "bool", "list", "dict", "set", "tuple", "type", "id", "len", 
        "map", "filter", "sum", "min", "max", "sorted", "input", "print", "format", "object", 
        "super", "next", "iter", "hash", "range", "repr", "slice", "zip", "vars", "dir", "open", 
        "eval", "exec", "abs", "all", "any", "bin", "chr", "ord", "hex", "oct", "pow", "round", 
        "property", "staticmethod", "classmethod"
    ];

    $saResult = "";
    $iLen = mb_strlen($saMaskedCode, "UTF-8");
    $i = 0;
    while ($i < $iLen) {
    $saCh = mb_substr($saMaskedCode,  $i,  1, "UTF-8");
        if ($saCh === "$") {
      $iJ = $i + 1;
            while ($iJ < $iLen && $bIsIdentChar(mb_substr($saMaskedCode,  $iJ,  1, "UTF-8")) === true) {
        $iJ = $iJ + 1;
      }
      $saName = mb_substr($saMaskedCode,  $i + 1,  $iJ - $i - 1, "UTF-8");
            if (Arr::indexOf($aPyKeywords,  $saName) !== -1 || Arr::indexOf($aPyBuiltins,  $saName) !== -1) {
        $saName = $saName . "_";
      }
      $saResult = $saResult . "" . $saName;
            $i = $iJ;
    }
    else {
      $saResult = $saResult . "" . $saCh;
            $i = $i + 1;
    }
  }
  return $saResult;
};
