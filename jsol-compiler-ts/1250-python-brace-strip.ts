declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

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


const $bIsWhitespaceCharPY = function($saCh: any): boolean {
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
const $saTrimWithPY = function($saVal: any): string {
  const $iLen: number = Str["len"]($saVal);
    let $iStart: number = 0;
    while ($iStart < $iLen && $bIsWhitespaceCharPY(Str["sub"]($saVal,  $iStart,  1)) === true) {
    $iStart = $iStart + 1;
  }
  let $iEnd: number = $iLen;
    while ($iEnd > $iStart && $bIsWhitespaceCharPY(Str["sub"]($saVal,  $iEnd - 1,  1)) === true) {
    $iEnd = $iEnd - 1;
  }
  return Str["sub"]($saVal,  $iStart,  $iEnd - $iStart);
};
const $saStripPythonBraces = function($saIndentedCode: any, $saIndentUnit: any): string {
  let $saResult: string = "";
    let $iDepth: number = 0;
    let $i: number = 0;
    const $iLen: number = Str["len"]($saIndentedCode);
    let $bStartOfLine: boolean = true;
    let $aOpenPositions: any[] = [];

    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saIndentedCode,  $i,  1);

        if ($saCh === "{") {
      $aOpenPositions.push( Str["len"]($saResult));
            $iDepth = $iDepth + 1;
            $saResult = $saResult + "\n";
            $bStartOfLine = true;
            $i = $i + 1;
    }
    else if ($saCh === "}") {
      let $iContentStart: number = 0;
            if ($aOpenPositions.length > 0) {
        $iContentStart = $aOpenPositions[$aOpenPositions.length - 1];
                Arr["pop"]($aOpenPositions);
      }
      const $saSinceOpen: string = Str["sub"]($saResult,  $iContentStart,  Str["len"]($saResult) - $iContentStart);
            if ($saTrimWithPY($saSinceOpen) === "") {
        for (let $iStep = 0; $iStep < $iDepth; $iStep = $iStep + 1) {
          $saResult = $saResult + "" + $saIndentUnit;
        }
        $saResult = $saResult + "pass\n";
      }
      $iDepth = $iDepth - 1;
            $saResult = $saResult + "\n";
            $bStartOfLine = true;
            $i = $i + 1;

            let $iPeek: number = $i;
            while ($iPeek < $iLen && $bIsWhitespaceCharPY(Str["sub"]($saIndentedCode,  $iPeek,  1)) === true) {
        $iPeek = $iPeek + 1;
      }
      if ($iPeek < $iLen && Str["sub"]($saIndentedCode,  $iPeek,  1) === ";") {
        $i = $iPeek + 1;
      }
    }
    else if ($saCh === "\n") {
      $saResult = $saResult + "\n";
            $bStartOfLine = true;
            $i = $i + 1;
    }
    else if ($bIsWhitespaceCharPY($saCh) === true) {
      if ($bStartOfLine === true) {
        $i = $i + 1;
      }
      else {
        $saResult = $saResult + "" + $saCh;
                $i = $i + 1;
      }
    }
    else {
      if ($bStartOfLine === true) {
        for (let $iStep = 0; $iStep < $iDepth; $iStep = $iStep + 1) {
          $saResult = $saResult + "" + $saIndentUnit;
        }
        $bStartOfLine = false;
      }
      $saResult = $saResult + "" + $saCh;
            $i = $i + 1;
    }
  }
  return $saResult;
};
