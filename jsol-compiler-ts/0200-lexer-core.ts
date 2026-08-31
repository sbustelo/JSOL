declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97
const $mLex_ScanString = function($saSource: any, $iStart: any, $iLen: any): Record<string, any> {
  const $saQuote: string = Str["sub"]($saSource,  $iStart,  1);
    let $i: number = $iStart + 1;
    while ($i < $iLen) {
    const $saChar: string = Str["sub"]($saSource,  $i,  1);
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
const $mLex_ScanLineComment = function($saSource: any, $iStart: any, $iLen: any): Record<string, any> {
  let $i: number = $iStart + 2;
    while ($i < $iLen) {
    if (Str["sub"]($saSource,  $i,  1) === "\n") {
      return JSOL.dict("end",  $i,  "val",  Str["sub"]($saSource,  $iStart,  $i - $iStart));
    }
    $i = $i + 1;
  }
  return JSOL.dict("end",  $iLen,  "val",  Str["sub"]($saSource,  $iStart,  $iLen - $iStart));
};
const $mLex_ScanBlockComment = function($saSource: any, $iStart: any, $iLen: any): Record<string, any> {
  let $i: number = $iStart + 2;
    while ($i < $iLen) {
    if (Str["sub"]($saSource,  $i,  2) === "*/") {
      return JSOL.dict("end",  $i + 2,  "val",  Str["sub"]($saSource,  $iStart,  ($i + 2) - $iStart));
    }
    $i = $i + 1;
  }
  return JSOL.dict("end",  $iLen,  "val",  Str["sub"]($saSource,  $iStart,  $iLen - $iStart));
};
const $mMaskSourceCode = function($saSourceCode: any): Record<string, any> {
  const $aTokens: any[] = [];
    let $saResult: string = "";
    let $iTokenIndex: number = 0;
    const $iLen: number = Str["len"]($saSourceCode);
    let $i: number = 0;

    while ($i < $iLen) {
    const $saChar: string = Str["sub"]($saSourceCode,  $i,  1);
        const $saNext: string = Str["sub"]($saSourceCode,  $i + 1,  1);

        if ($saChar === "\"" || $saChar === "'" || $saChar === "`") {
      const $mData: Record<string, any> = $mLex_ScanString($saSourceCode, $i, $iLen);
            const $saKey: string = Str["concat"]("__JSOL_STR_",  $iTokenIndex,  "__");
            $aTokens.push( JSOL.dict("key",  $saKey,  "value",  $mData["val"]));
            $saResult = Str["concat"]($saResult,  $saKey);
            $iTokenIndex = $iTokenIndex + 1;
            $i = $mData["end"];
    }
    else if ($saChar === "/" && $saNext === "/") {
      const $mData: Record<string, any> = $mLex_ScanLineComment($saSourceCode, $i, $iLen);
            const $saKey: string = Str["concat"]("__JSOL_COM_",  $iTokenIndex,  "__");
            $aTokens.push( JSOL.dict("key",  $saKey,  "value",  $mData["val"]));
            $saResult = Str["concat"]($saResult,  $saKey);
            $iTokenIndex = $iTokenIndex + 1;
            $i = $mData["end"];
    }
    else if ($saChar === "/" && $saNext === "*") {
      const $mData: Record<string, any> = $mLex_ScanBlockComment($saSourceCode, $i, $iLen);
            const $saKey: string = Str["concat"]("__JSOL_COM_",  $iTokenIndex,  "__");
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
const $saUnmaskSourceCode = function($saMaskedCode: any, $aTokens: any): string {
  let $saRestoredCode: string = $saMaskedCode;
    const $iTokenCount: number = $aTokens.length;
    for (let $i = 0; $i < $iTokenCount; $i = $i + 1) {
    const $mToken: Record<string, any> = $aTokens[$i];
        $saRestoredCode = Str["replace"]($saRestoredCode,  $mToken["key"],  $mToken["value"]);
  }
  return $saRestoredCode;
};
