declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - Python Translators & Sanitizers
const $aTranslateCommentTokensToPython = function($aTokens: any): any[] {
  let $aResult: any[] = [];
    for (let $i = 0; $i < $aTokens.length; $i = $i + 1) {
    const $mToken: Record<string, any> = $aTokens[$i];
        const $saKey: string = $mToken["key"];
        const $saVal: string = $mToken["value"];

        if (Str["sub"]($saVal,  0,  2) === "//") {
      const $saRest: string = Str["sub"]($saVal,  2,  Str["len"]($saVal) - 2);
            $aResult.push( JSOL.dict("key",  $saKey,  "value",  "#" + "" + $saRest));
    }
    else if (Str["sub"]($saVal,  0,  2) === "/*") {
      let $saInner: string = Str["sub"]($saVal,  2,  Str["len"]($saVal) - 2);
            if (Str["sub"]($saInner,  Str["len"]($saInner) - 2,  2) === "*/") {
        $saInner = Str["sub"]($saInner,  0,  Str["len"]($saInner) - 2);
      }
      const $saConverted: string = "#" + "" + Str["replace"]($saInner,  "\n",  "\n#");
            $aResult.push( JSOL.dict("key",  $saKey,  "value",  $saConverted));
    }
    else {
      $aResult.push( JSOL.dict("key",  $saKey,  "value",  $saVal));
    }
  }
  return $aResult;
};
const $saTranslateOperators = function($saExpr: any): string {
  let $saResult: string = "";
    let $i: number = 0;
    const $iLen: number = Str["len"]($saExpr);

    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saExpr,  $i,  1);
        const $bAtBoundary: boolean = ($i === 0) || ($bIsIdentChar(Str["sub"]($saExpr,  $i - 1,  1)) === false);

        if ($bAtBoundary === true && $bIsIdentChar($saCh) === true) {
      const $mWord: Record<string, any> = $mReadWord($saExpr, $i);
            const $saWordStr: string = $mWord["word"];

            if ($saWordStr === "true") {
        $saResult = $saResult + "" + "True"; $i = $mWord["end"];
      }
      else if ($saWordStr === "false") {
        $saResult = $saResult + "" + "False"; $i = $mWord["end"];
      }
      else if ($saWordStr === "null") {
        $saResult = $saResult + "" + "None"; $i = $mWord["end"];
      }
      else {
        $saResult = $saResult + "" + $saWordStr; $i = $mWord["end"];
      }
    }
    else {
      const $saTwo: string = Str["sub"]($saExpr,  $i,  2);
            const $saThree: string = Str["sub"]($saExpr,  $i,  3);

            if ($saThree === "===") {
        $saResult = $saResult + "" + "=="; $i = $i + 3;
      }
      else if ($saThree === "!==") {
        $saResult = $saResult + "" + "!="; $i = $i + 3;
      }
      else if ($saTwo === "&&") {
        $saResult = $saResult + "" + "and"; $i = $i + 2;
      }
      else if ($saTwo === "||") {
        $saResult = $saResult + "" + "or"; $i = $i + 2;
      }
      else if ($saTwo === "!=") {
        $saResult = $saResult + "" + "!="; $i = $i + 2;
      }
      else if (Str["sub"]($saExpr,  $i,  1) === "!") {
        $saResult = $saResult + "" + "not "; $i = $i + 1;
      }
      else {
        $saResult = $saResult + "" + $saCh; $i = $i + 1;
      }
    }
  }
  return $saResult;
};
const $saSanitizePythonIdentifiers = function($saMaskedCode: any): string {
  const $aPyKeywords: any[] = [
        "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", 
        "continue", "def", "del", "elif", "else", "except", "finally", "for", "from", "global", 
        "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
        "try", "while", "with", "yield"
    ];
    const $aPyBuiltins: any[] = [
        "str", "int", "float", "bool", "list", "dict", "set", "tuple", "type", "id", "len", 
        "map", "filter", "sum", "min", "max", "sorted", "input", "print", "format", "object", 
        "super", "next", "iter", "hash", "range", "repr", "slice", "zip", "vars", "dir", "open", 
        "eval", "exec", "abs", "all", "any", "bin", "chr", "ord", "hex", "oct", "pow", "round", 
        "property", "staticmethod", "classmethod"
    ];

    let $saResult: string = "";
    const $iLen: number = Str["len"]($saMaskedCode);
    let $i: number = 0;
    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saMaskedCode,  $i,  1);
        if ($saCh === "$") {
      let $iJ: number = $i + 1;
            while ($iJ < $iLen && $bIsIdentChar(Str["sub"]($saMaskedCode,  $iJ,  1)) === true) {
        $iJ = $iJ + 1;
      }
      let $saName: string = Str["sub"]($saMaskedCode,  $i + 1,  $iJ - $i - 1);
            if (Arr["indexOf"]($aPyKeywords,  $saName) !== -1 || Arr["indexOf"]($aPyBuiltins,  $saName) !== -1) {
        $saName = $saName + "_";
      }
      $saResult = $saResult + "" + $saName;
            $i = $iJ;
    }
    else {
      $saResult = $saResult + "" + $saCh;
            $i = $i + 1;
    }
  }
  return $saResult;
};
