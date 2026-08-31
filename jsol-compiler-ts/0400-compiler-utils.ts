declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - AST-Free Global Utilities (1/2)

const $bComp_IsWordChar = function($saCh: any): boolean {
  if ($saCh === "") {
    return false;
  }
  const $iCode: number = Str["char"]($saCh,  0);
    if ($iCode >= 48 && $iCode <= 57) {
    return true;
  }
  if ($iCode >= 65 && $iCode <= 90) {
    return true;
  }
  if ($iCode >= 97 && $iCode <= 122) {
    return true;
  }
  if ($iCode === 95) {
    return true;
  }
  return false;
};
const $mComp_ParseArgs = function($saCode: any, $iOpenParen: any): Record<string, any> {
  let $iParenCount: number = 1;
    let $iBracketCount: number = 0;
    let $iBraceCount: number = 0;
    let $bInStr: boolean = false;
    let $iCloseParen: number = -1;
    let $aArgs: any[] = [];
    let $iCurrentArgStart: number = $iOpenParen + 1;
    const $iRLen: number = Str["len"]($saCode);

    for (let $i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
    const $saChar: string = Str["sub"]($saCode,  $i,  1);
        const $saPrev: string = Str["sub"]($saCode,  $i - 1,  1);
        if ($saChar === "\"" && $saPrev !== "\\") {
      $bInStr = !$bInStr;
    }
    if ($bInStr === false) {
      if ($saChar === "(") {
        $iParenCount = $iParenCount + 1;
      }
      if ($saChar === ")") {
        $iParenCount = $iParenCount - 1;
      }
      if ($saChar === "[") {
        $iBracketCount = $iBracketCount + 1;
      }
      if ($saChar === "]") {
        $iBracketCount = $iBracketCount - 1;
      }
      if ($saChar === "{") {
        $iBraceCount = $iBraceCount + 1;
      }
      if ($saChar === "}") {
        $iBraceCount = $iBraceCount - 1;
      }
    }
    if ($saChar === "," && $iParenCount === 1 && $iBracketCount === 0 && $iBraceCount === 0 && $bInStr === false) {
      $aArgs.push( Str["sub"]($saCode,  $iCurrentArgStart,  $i - $iCurrentArgStart));
            $iCurrentArgStart = $i + 1;
    }
    else if ($iParenCount === 0) {
      $aArgs.push( Str["sub"]($saCode,  $iCurrentArgStart,  $i - $iCurrentArgStart));
            $iCloseParen = $i;
            break;
    }
  }
  return JSOL.dict("close",  $iCloseParen,  "args",  $aArgs);
};
const $iComp_FindCloseBrace = function($saCode: any, $iOpenBrace: any): number {
  let $iBraceCount: number = 1;
    const $iRLen: number = Str["len"]($saCode);
    for (let $i = $iOpenBrace + 1; $i < $iRLen; $i = $i + 1) {
    const $saChar: string = Str["sub"]($saCode,  $i,  1);
        if ($saChar === "{") {
      $iBraceCount = $iBraceCount + 1;
    }
    if ($saChar === "}") {
      $iBraceCount = $iBraceCount - 1;
    }
    if ($iBraceCount === 0) {
      return $i;
    }
  }
  return -1;
};
const $iComp_FindCloseParen = function($saCode: any, $iOpenParen: any): number {
  let $iParenCount: number = 1;
    const $iRLen: number = Str["len"]($saCode);
    for (let $i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
    const $saChar: string = Str["sub"]($saCode,  $i,  1);
        if ($saChar === "(") {
      $iParenCount = $iParenCount + 1;
    }
    if ($saChar === ")") {
      $iParenCount = $iParenCount - 1;
    }
    if ($iParenCount === 0) {
      return $i;
    }
  }
  return -1;
};
const $iComp_FindStmtEnd = function($saCode: any, $iStart: any): number {
  const $iRLen: number = Str["len"]($saCode);
    let $iEndIdx: number = $iStart;
    let $bFindingEnd: boolean = true;
    while ($iEndIdx < $iRLen && $bFindingEnd === true) {
    const $saChar: string = Str["sub"]($saCode,  $iEndIdx,  1);
        if ($saChar === " " || $saChar === "\n" || $saChar === "\r" || $saChar === ")" || $saChar === ";") {
      $iEndIdx = $iEndIdx + 1;
    }
    else {
      $bFindingEnd = false;
    }
  }
  return $iEndIdx;
};
