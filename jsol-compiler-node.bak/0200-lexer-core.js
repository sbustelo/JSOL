// @JSOL v0.2.97
const $mLex_ScanString = function($saSource, $iStart, $iLen) {
  const $saQuote = Str["sub"]($saSource,  $iStart,  1);
    let $i = $iStart + 1;
    while ($i < $iLen) {
    const $saChar = Str["sub"]($saSource,  $i,  1);
        if ($saChar === "\\") {
      $i = $i + 2;
    }
    else if ($saChar === $saQuote) {
      return JSOL.dict("end",  $i + 1,  "val",  Str["sub"]($saSource,  $iStart,  ($i + 1) - $iStart));
    }
    else {
      $i = $i + 1;
    }
  }
  return JSOL.dict("end",  $iLen,  "val",  Str["sub"]($saSource,  $iStart,  $iLen - $iStart));
};
const $mLex_ScanLineComment = function($saSource, $iStart, $iLen) {
  let $i = $iStart + 2;
    while ($i < $iLen) {
    if (Str["sub"]($saSource,  $i,  1) === "\n") {
      return JSOL.dict("end",  $i,  "val",  Str["sub"]($saSource,  $iStart,  $i - $iStart));
    }
    $i = $i + 1;
  }
  return JSOL.dict("end",  $iLen,  "val",  Str["sub"]($saSource,  $iStart,  $iLen - $iStart));
};
const $mLex_ScanBlockComment = function($saSource, $iStart, $iLen) {
  let $i = $iStart + 2;
    while ($i < $iLen) {
    if (Str["sub"]($saSource,  $i,  2) === "*/") {
      return JSOL.dict("end",  $i + 2,  "val",  Str["sub"]($saSource,  $iStart,  ($i + 2) - $iStart));
    }
    $i = $i + 1;
  }
  return JSOL.dict("end",  $iLen,  "val",  Str["sub"]($saSource,  $iStart,  $iLen - $iStart));
};
const $mMaskSourceCode = function($saSourceCode) {
  const $aTokens = [];
    let $saResult = "";
    let $iTokenIndex = 0;
    const $iLen = Str["len"]($saSourceCode);
    let $i = 0;

    while ($i < $iLen) {
    const $saChar = Str["sub"]($saSourceCode,  $i,  1);
        const $saNext = Str["sub"]($saSourceCode,  $i + 1,  1);

        if ($saChar === "\"" || $saChar === "'" || $saChar === "`") {
      const $mData = $mLex_ScanString($saSourceCode, $i, $iLen);
            const $saKey = Str["concat"]("__JSOL_STR_",  $iTokenIndex,  "__");
            $aTokens.push( JSOL.dict("key",  $saKey,  "value",  $mData["val"]));
            $saResult = Str["concat"]($saResult,  $saKey);
            $iTokenIndex = $iTokenIndex + 1;
            $i = $mData["end"];
    }
    else if ($saChar === "/" && $saNext === "/") {
      const $mData = $mLex_ScanLineComment($saSourceCode, $i, $iLen);
            const $saKey = Str["concat"]("__JSOL_COM_",  $iTokenIndex,  "__");
            $aTokens.push( JSOL.dict("key",  $saKey,  "value",  $mData["val"]));
            $saResult = Str["concat"]($saResult,  $saKey);
            $iTokenIndex = $iTokenIndex + 1;
            $i = $mData["end"];
    }
    else if ($saChar === "/" && $saNext === "*") {
      const $mData = $mLex_ScanBlockComment($saSourceCode, $i, $iLen);
            const $saKey = Str["concat"]("__JSOL_COM_",  $iTokenIndex,  "__");
            $aTokens.push( JSOL.dict("key",  $saKey,  "value",  $mData["val"]));
            $saResult = Str["concat"]($saResult,  $saKey);
            $iTokenIndex = $iTokenIndex + 1;
            $i = $mData["end"];
    }
    else {
      $saResult = Str["concat"]($saResult,  $saChar);
            $i = $i + 1;
    }
  }
  return JSOL.dict("maskedCode",  $saResult,  "tokens",  $aTokens);
};
const $saUnmaskSourceCode = function($saMaskedCode, $aTokens) {
  let $saRestoredCode = $saMaskedCode;
    const $iTokenCount = $aTokens.length;
    for (let $i = 0; $i < $iTokenCount; $i = $i + 1) {
    const $mToken = $aTokens[$i];
        $saRestoredCode = Str["replace"]($saRestoredCode,  $mToken["key"],  $mToken["value"]);
  }
  return $saRestoredCode;
};
