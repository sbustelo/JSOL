// @JSOL v0.2.95 - Python Ternary Reorderer
//
// Runs on MASKED code, BEFORE $sConvertControlFlowToPython (still JS-shaped
// operators: &&, ||, ===, null, true, false — the next pass handles those
// generically wherever they land, so this pass doesn't need to translate
// anything inside cond/trueBranch/falseBranch itself, only reorder them).
//
// SCOPE, DELIBERATELY NARROW:
//   - Only detects "X = <cond> ? <a> : <b>;" and "return <cond> ? <a> : <b>;"
//   - Does NOT support nested ternaries (a ternary inside a or b's own text).
//   - Does NOT support a ternary used as a function call argument.
// If neither shape matches at a given "?", the character is left untouched —
// no silent mangling, no guessing.
//
// Usage: standalone first, same discipline as indenter.jsol and
// python-compiler.jsol. Do not wire into engine.jsol until validated.

// NOTE: $bIsWhitespaceCharTrim / $sTrimWhitespace are defined in
// python-compiler.jsol, not duplicated here — both files always load
// together in the same concatenated script (harness or, later, the real
// `parts` array), and a duplicate top-level const would collide.

const $bIsIdentChar2 = function($sCh) {
  if ($sCh === "_") {
    return true;
  }
  if ($sCh === "$") {
    return true;
  }
  if ($sCh >= "a" && $sCh <= "z") {
    return true;
  }
  if ($sCh >= "A" && $sCh <= "Z") {
    return true;
  }
  if ($sCh >= "0" && $sCh <= "9") {
    return true;
  }
  return false;
};
// Scans forward from $iStart looking for the terminating ";" of the CURRENT
// statement, tracking paren/bracket depth so a ";" inside a nested call isn't
// mistaken for the statement end. Returns the index of that ";" (or $iLen if
// none found — malformed input, caller should treat as "no ternary found").
const $iFindStatementEnd = function($sCode, $iStart) {
  const $iLen = $sCode.length;
    let $iParenDepth = 0;
    let $iBracketDepth = 0;
    let $i = $iStart;

    while ($i < $iLen) {
    const $sCh = $sCode.substring( $i, ( $i) + ( 1));
        if ($sCh === "(") {
      $iParenDepth = $iParenDepth + 1;
    }
    else if ($sCh === ")") {
      $iParenDepth = $iParenDepth - 1;
    }
    else if ($sCh === "[") {
      $iBracketDepth = $iBracketDepth + 1;
    }
    else if ($sCh === "]") {
      $iBracketDepth = $iBracketDepth - 1;
    }
    else if ($sCh === ";" && $iParenDepth === 0 && $iBracketDepth === 0) {
      return $i;
    }
    $i = $i + 1;
  }
  return $iLen;
};
// Within $sExpr (a full statement RHS, no trailing ";"), finds a top-level
// "?" and its matching top-level ":" (both at paren/bracket depth 0). Returns
// "ok"=false if no top-level "?" exists at all — meaning this is a plain
// expression, not a ternary, and must be left untouched by the caller.
const $mSplitTernary = function($sExpr) {
  const $iLen = $sExpr.length;
    let $iParenDepth = 0;
    let $iBracketDepth = 0;
    let $iQuestionIndex = -1;
    let $iColonIndex = -1;
    let $i = 0;

    while ($i < $iLen) {
    const $sCh = $sExpr.substring( $i, ( $i) + ( 1));
        if ($sCh === "(") {
      $iParenDepth = $iParenDepth + 1;
    }
    else if ($sCh === ")") {
      $iParenDepth = $iParenDepth - 1;
    }
    else if ($sCh === "[") {
      $iBracketDepth = $iBracketDepth + 1;
    }
    else if ($sCh === "]") {
      $iBracketDepth = $iBracketDepth - 1;
    }
    else if ($sCh === "?" && $iParenDepth === 0 && $iBracketDepth === 0 && $iQuestionIndex === -1) {
      $iQuestionIndex = $i;
    }
    else if ($sCh === ":" && $iParenDepth === 0 && $iBracketDepth === 0 && $iQuestionIndex !== -1 && $iColonIndex === -1) {
      $iColonIndex = $i;
    }
    $i = $i + 1;
  }
  if ($iQuestionIndex === -1 || $iColonIndex === -1) {
    return JSOL.dict("ok",  false);
  }
  const $sCond = $sTrimWhitespace($sExpr.substring( 0, ( 0) + ( $iQuestionIndex)));
    const $sTrue = $sTrimWhitespace($sExpr.substring( $iQuestionIndex + 1, ( $iQuestionIndex + 1) + ( $iColonIndex - ($iQuestionIndex + 1))));
    const $sFalse = $sTrimWhitespace($sExpr.substring( $iColonIndex + 1, ( $iColonIndex + 1) + ( $iLen - ($iColonIndex + 1))));

    return JSOL.dict("ok",  true,  "cond",  $sCond,  "true",  $sTrue,  "false",  $sFalse);
};
const $sConvertTernaries = function($sMaskedCode) {
  let $sResult = "";
    let $i = 0;
    const $iLen = $sMaskedCode.length;

    while ($i < $iLen) {
    const $sCh = $sMaskedCode.substring( $i, ( $i) + ( 1));

        // Trigger 1: "return <expr>;"
        const $bAtBoundary = ($i === 0) || ($bIsIdentChar2($sMaskedCode.substring( $i - 1, ( $i - 1) + ( 1))) === false);
        let $bHandled = false;

        if ($bAtBoundary === true && $sMaskedCode.substring( $i, ( $i) + ( 7)) === "return " && $bIsIdentChar2($sMaskedCode.substring( $i + 6, ( $i + 6) + ( 1))) === false) {
      const $iRhsStart = $i + 7;
            const $iStmtEnd = $iFindStatementEnd($sMaskedCode, $iRhsStart);
            const $sRhs = $sMaskedCode.substring( $iRhsStart, ( $iRhsStart) + ( $iStmtEnd - $iRhsStart));
            const $mSplit = $mSplitTernary($sRhs);

            if ($mSplit["ok"] === true) {
        $sResult = $sResult + "" + "return (" + "" + $mSplit["true"] + "" + " if " + "" + $mSplit["cond"] + "" + " else " + "" + $mSplit["false"] + "" + ")" + ";";
                $i = $iStmtEnd + 1;
                $bHandled = true;
      }
    }
    // Trigger 2: a lone "=" (assignment, not "==" / "===" / "<=" / ">=" / "!=")
        if ($bHandled === false && $sCh === "=") {
      const $sPrevCh = $sMaskedCode.substring( $i - 1, ( $i - 1) + ( 1));
            const $sNextCh = $sMaskedCode.substring( $i + 1, ( $i + 1) + ( 1));
            const $bIsPlainAssign = (($sNextCh !== "=") &&
                ($sPrevCh !== "=") && ($sPrevCh !== "<") && ($sPrevCh !== ">") && ($sPrevCh !== "!"));

            if ($bIsPlainAssign === true) {
        const $iRhsStart = $i + 1;
                const $iStmtEnd = $iFindStatementEnd($sMaskedCode, $iRhsStart);
                const $sRhs = $sMaskedCode.substring( $iRhsStart, ( $iRhsStart) + ( $iStmtEnd - $iRhsStart));
                const $mSplit = $mSplitTernary($sRhs);

                if ($mSplit["ok"] === true) {
          $sResult = $sResult + "" + "= (" + "" + $mSplit["true"] + "" + " if " + "" + $mSplit["cond"] + "" + " else " + "" + $mSplit["false"] + "" + ")" + ";";
                    $i = $iStmtEnd + 1;
                    $bHandled = true;
        }
      }
    }
    if ($bHandled === false) {
      $sResult = $sResult + "" + $sCh;
            $i = $i + 1;
    }
  }
  return $sResult;
};
