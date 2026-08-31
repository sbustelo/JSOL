declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

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


const $saInd_RepeatUnit = function($saUnit: any, $iCount: any): string {
  let $saOut: string = "";
    for (let $i = 0; $i < $iCount; $i = $i + 1) {
    $saOut = Str["concat"]($saOut,  $saUnit);
  }
  return $saOut;
};
const $bInd_IsWhitespace = function($saCh: any): boolean {
  return $saCh === " " || $saCh === "\t" || $saCh === "\n" || $saCh === "\r";
};
const $saInd_RTrimBuffer = function($saBuf: any): string {
  let $iEnd: number = Str["len"]($saBuf);
    while ($iEnd > 0 && $bInd_IsWhitespace(Str["sub"]($saBuf,  $iEnd - 1,  1)) === true) {
    $iEnd = $iEnd - 1;
  }
  return Str["sub"]($saBuf,  0,  $iEnd);
};
const $iInd_SkipWhitespace = function($saCode: any, $iStart: any, $iLen: any): number {
  let $i: number = $iStart;
    while ($i < $iLen && $bInd_IsWhitespace(Str["sub"]($saCode,  $i,  1)) === true) {
    $i = $i + 1;
  }
  return $i;
};
const $saIndentCode = function($saMaskedCode: any, $saIndentUnit: any): string {
  let $saResult: string = "";
    let $iDepth: number = 0;
    let $i: number = 0;
    const $iLen: number = Str["len"]($saMaskedCode);

    while ($i < $iLen) {
    const $saChar: string = Str["sub"]($saMaskedCode,  $i,  1);

        if ($saChar === "{") {
      $iDepth = $iDepth + 1;
            $saResult = Str["concat"]($saResult,  "{\n",  $saInd_RepeatUnit($saIndentUnit, $iDepth));
            $i = $iInd_SkipWhitespace($saMaskedCode, $i + 1, $iLen);
    }
    else if ($saChar === "}") {
      $iDepth = $iDepth - 1;
            $saResult = Str["concat"]($saInd_RTrimBuffer($saResult),  "\n",  $saInd_RepeatUnit($saIndentUnit, $iDepth),  "}");
            $i = $iInd_SkipWhitespace($saMaskedCode, $i + 1, $iLen);
            
            if ($i < $iLen && Str["sub"]($saMaskedCode,  $i,  1) === ";") {
        $saResult = Str["concat"]($saResult,  ";");
                $i = $iInd_SkipWhitespace($saMaskedCode, $i + 1, $iLen);
      }
      $saResult = Str["concat"]($saResult,  "\n",  $saInd_RepeatUnit($saIndentUnit, $iDepth));
    }
    else {
      $saResult = Str["concat"]($saResult,  $saChar);
            $i = $i + 1;
    }
  }
  return $saResult;
};
