// @JSOL v0.2.95 - Python Brace Stripper
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
//
// Usage: standalone first, same discipline as every other piece in this
// pipeline. Do not wire into engine.jsol until validated.

const $bIsWhitespaceCharPY = function($sCh) {
  if ($sCh === " ") {
    return true;
  }
  if ($sCh === "\t") {
    return true;
  }
  if ($sCh === "\n") {
    return true;
  }
  if ($sCh === "\r") {
    return true;
  }
  return false;
};
const $sTrimWithPY = function($sVal) {
  const $iLen = $sVal.length;
    let $iStart = 0;
    while ($iStart < $iLen && $bIsWhitespaceCharPY($sVal.substring( $iStart, ( $iStart) + ( 1))) === true) {
    $iStart = $iStart + 1;
  }
  let $iEnd = $iLen;
    while ($iEnd > $iStart && $bIsWhitespaceCharPY($sVal.substring( $iEnd - 1, ( $iEnd - 1) + ( 1))) === true) {
    $iEnd = $iEnd - 1;
  }
  return $sVal.substring( $iStart, ( $iStart) + ( $iEnd - $iStart));
};
const $sStripPythonBraces = function($sIndentedCode, $sIndentUnit) {
  let $sResult = "";
    let $iDepth = 0;
    let $i = 0;
    const $iLen = $sIndentedCode.length;
    let $bStartOfLine = true;
    let $aOpenPositions = [];

    while ($i < $iLen) {
    const $sCh = $sIndentedCode.substring( $i, ( $i) + ( 1));

        if ($sCh === "{") {
      $aOpenPositions.push( $sResult.length);
            $iDepth = $iDepth + 1;
            $sResult = $sResult + "\n";
            $bStartOfLine = true;
            $i = $i + 1;
    }
    else if ($sCh === "}") {
      let $iContentStart = 0;
            if ($aOpenPositions.length > 0) {
        $iContentStart = $aOpenPositions[$aOpenPositions.length - 1];
                $aOpenPositions.pop();
      }
      const $sSinceOpen = $sResult.substring( $iContentStart, ( $iContentStart) + ( $sResult.length - $iContentStart));
            if ($sTrimWithPY($sSinceOpen) === "") {
        for (let $iStep = 0; $iStep < $iDepth; $iStep = $iStep + 1) {
          $sResult = $sResult + "" + $sIndentUnit;
        }
        $sResult = $sResult + "pass\n";
      }
      $iDepth = $iDepth - 1;
            $sResult = $sResult + "\n";
            $bStartOfLine = true;
            $i = $i + 1;

            let $iPeek = $i;
            while ($iPeek < $iLen && $bIsWhitespaceCharPY($sIndentedCode.substring( $iPeek, ( $iPeek) + ( 1))) === true) {
        $iPeek = $iPeek + 1;
      }
      if ($iPeek < $iLen && $sIndentedCode.substring( $iPeek, ( $iPeek) + ( 1)) === ";") {
        $i = $iPeek + 1;
      }
    }
    else if ($sCh === "\n") {
      $sResult = $sResult + "\n";
            $bStartOfLine = true;
            $i = $i + 1;
    }
    else if ($bIsWhitespaceCharPY($sCh) === true) {
      if ($bStartOfLine === true) {
        $i = $i + 1;
      }
      else {
        $sResult = $sResult + "" + $sCh;
                $i = $i + 1;
      }
    }
    else {
      if ($bStartOfLine === true) {
        for (let $iStep = 0; $iStep < $iDepth; $iStep = $iStep + 1) {
          $sResult = $sResult + "" + $sIndentUnit;
        }
        $bStartOfLine = false;
      }
      $sResult = $sResult + "" + $sCh;
            $i = $i + 1;
    }
  }
  return $sResult;
};
