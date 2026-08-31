declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - Python Compiler Utilities
const $bIsWhitespaceCharTrim = function($saCh: any): boolean {
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
const $saTrimWhitespace = function($saVal: any): string {
  const $iLen: number = Str["len"]($saVal);
    let $iStart: number = 0;
    while ($iStart < $iLen && $bIsWhitespaceCharTrim(Str["sub"]($saVal,  $iStart,  1)) === true) {
    $iStart = $iStart + 1;
  }
  let $iEnd: number = $iLen;
    while ($iEnd > $iStart && $bIsWhitespaceCharTrim(Str["sub"]($saVal,  $iEnd - 1,  1)) === true) {
    $iEnd = $iEnd - 1;
  }
  return Str["sub"]($saVal,  $iStart,  $iEnd - $iStart);
};
const $bIsIdentChar = function($saCh: any): boolean {
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
const $mReadWord = function($saCode: any, $iStart: any): Record<string, any> {
  const $iLen: number = Str["len"]($saCode);
    let $i: number = $iStart;
    while ($i < $iLen && $bIsIdentChar(Str["sub"]($saCode,  $i,  1)) === true) {
    $i = $i + 1;
  }
  return JSOL.dict("word",  Str["sub"]($saCode,  $iStart,  $i - $iStart),  "end",  $i);
};
const $iSkipWhitespace = function($saCode: any, $iStart: any): number {
  const $iLen: number = Str["len"]($saCode);
    let $i: number = $iStart;
    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saCode,  $i,  1);
        if ($saCh === " " || $saCh === "\t" || $saCh === "\n" || $saCh === "\r") {
      $i = $i + 1;
    }
    else {
      return $i;
    }
  }
  return $i;
};
const $mReadBalancedParens = function($saCode: any, $iOpenIndex: any): Record<string, any> {
  const $iLen: number = Str["len"]($saCode);
    let $iDepth: number = 0;
    let $i: number = $iOpenIndex;
    let $iInsideStart: number = -1;

    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saCode,  $i,  1);
        if ($saCh === "(") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($saCh === ")") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL.dict(
                    "inside",  Str["sub"]($saCode,  $iInsideStart,  $i - $iInsideStart), 
                    "end",  $i + 1
                );
      }
    }
    $i = $i + 1;
  }
  return JSOL.dict("inside",  "",  $iLen);
};
const $mReadBalancedBraces = function($saCode: any, $iOpenIndex: any): Record<string, any> {
  const $iLen: number = Str["len"]($saCode);
    let $iDepth: number = 0;
    let $i: number = $iOpenIndex;
    let $iInsideStart: number = -1;
    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saCode,  $i,  1);
        if ($saCh === "{") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($saCh === "}") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL.dict("inside",  Str["sub"]($saCode,  $iInsideStart,  $i - $iInsideStart),  "end",  $i + 1);
      }
    }
    $i = $i + 1;
  }
  return JSOL.dict("inside",  "",  $iLen);
};
