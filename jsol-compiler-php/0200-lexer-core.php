<?php
// @JSOL v0.2.97
$mLex_ScanString = function($saSource, $iStart, $iLen) {
  $saQuote = mb_substr($saSource,  $iStart,  1, "UTF-8");
    $i = $iStart + 1;
    while ($i < $iLen) {
    $saChar = mb_substr($saSource,  $i,  1, "UTF-8");
        if ($saChar === "\\") {
      $i = $i + 2;
    }
    else if ($saChar === $saQuote) {
      return JSOL::dict("end",  $i + 1,  "val",  mb_substr($saSource,  $iStart,  ($i + 1) - $iStart, "UTF-8"));
    }
    else {
      $i = $i + 1;
    }
  }
  return JSOL::dict("end",  $iLen,  "val",  mb_substr($saSource,  $iStart,  $iLen - $iStart, "UTF-8"));
};
$mLex_ScanLineComment = function($saSource, $iStart, $iLen) {
  $i = $iStart + 2;
    while ($i < $iLen) {
    if (mb_substr($saSource,  $i,  1, "UTF-8") === "\n") {
      return JSOL::dict("end",  $i,  "val",  mb_substr($saSource,  $iStart,  $i - $iStart, "UTF-8"));
    }
    $i = $i + 1;
  }
  return JSOL::dict("end",  $iLen,  "val",  mb_substr($saSource,  $iStart,  $iLen - $iStart, "UTF-8"));
};
$mLex_ScanBlockComment = function($saSource, $iStart, $iLen) {
  $i = $iStart + 2;
    while ($i < $iLen) {
    if (mb_substr($saSource,  $i,  2, "UTF-8") === "*/") {
      return JSOL::dict("end",  $i + 2,  "val",  mb_substr($saSource,  $iStart,  ($i + 2) - $iStart, "UTF-8"));
    }
    $i = $i + 1;
  }
  return JSOL::dict("end",  $iLen,  "val",  mb_substr($saSource,  $iStart,  $iLen - $iStart, "UTF-8"));
};
$mMaskSourceCode = function($saSourceCode) use (&$mLex_ScanString, &$mLex_ScanLineComment, &$mLex_ScanBlockComment) {
  $aTokens = [];
    $saResult = "";
    $iTokenIndex = 0;
    $iLen = mb_strlen($saSourceCode, "UTF-8");
    $i = 0;

    while ($i < $iLen) {
    $saChar = mb_substr($saSourceCode,  $i,  1, "UTF-8");
        $saNext = mb_substr($saSourceCode,  $i + 1,  1, "UTF-8");

        if ($saChar === "\"" || $saChar === "'" || $saChar === "`") {
      $mData = $mLex_ScanString($saSourceCode, $i, $iLen);
            $saKey = Str::concat("__JSOL_STR_",  $iTokenIndex,  "__");
            $aTokens[] =  JSOL::dict("key",  $saKey,  "value",  $mData["val"]);
            $saResult = Str::concat($saResult,  $saKey);
            $iTokenIndex = $iTokenIndex + 1;
            $i = $mData["end"];
    }
    else if ($saChar === "/" && $saNext === "/") {
      $mData = $mLex_ScanLineComment($saSourceCode, $i, $iLen);
            $saKey = Str::concat("__JSOL_COM_",  $iTokenIndex,  "__");
            $aTokens[] =  JSOL::dict("key",  $saKey,  "value",  $mData["val"]);
            $saResult = Str::concat($saResult,  $saKey);
            $iTokenIndex = $iTokenIndex + 1;
            $i = $mData["end"];
    }
    else if ($saChar === "/" && $saNext === "*") {
      $mData = $mLex_ScanBlockComment($saSourceCode, $i, $iLen);
            $saKey = Str::concat("__JSOL_COM_",  $iTokenIndex,  "__");
            $aTokens[] =  JSOL::dict("key",  $saKey,  "value",  $mData["val"]);
            $saResult = Str::concat($saResult,  $saKey);
            $iTokenIndex = $iTokenIndex + 1;
            $i = $mData["end"];
    }
    else {
      $saResult = Str::concat($saResult,  $saChar);
            $i = $i + 1;
    }
  }
  return JSOL::dict("maskedCode",  $saResult,  "tokens",  $aTokens);
};
$saUnmaskSourceCode = function($saMaskedCode, $aTokens) {
  $saRestoredCode = $saMaskedCode;
    $iTokenCount = count($aTokens);
    for ($i = 0; $i < $iTokenCount; $i = $i + 1) {
    $mToken = $aTokens[$i];
        $saRestoredCode = str_replace( $mToken["key"],  $mToken["value"], $saRestoredCode);
  }
  return $saRestoredCode;
};
