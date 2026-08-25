<?php
// @JSOL v0.2.96 - Python Ternary Reorderer
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

$bIsIdentChar2 = function($sCh) {
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
$iFindStatementEnd = function($sCode, $iStart) {
  $iLen = mb_strlen($sCode, "UTF-8");
    $iParenDepth = 0;
    $iBracketDepth = 0;
    $i = $iStart;

    while ($i < $iLen) {
    $sCh = mb_substr($sCode,  $i,  1, "UTF-8");
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
$mSplitTernary = function($sExpr) use (&$sTrimWhitespace) {
  $iLen = mb_strlen($sExpr, "UTF-8");
    $iParenDepth = 0;
    $iBracketDepth = 0;
    $iQuestionIndex = -1;
    $iColonIndex = -1;
    $i = 0;

    while ($i < $iLen) {
    $sCh = mb_substr($sExpr,  $i,  1, "UTF-8");
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
    else if ($sCh === "?" && $iParenDepth === 0 && $iBracketDepth === 0) {
      if ($iQuestionIndex === -1) {
        $iQuestionIndex = $i;
      }
      else {
        // A second top-level "?" before we've found the matching
                // ":" means a nested ternary in the true-branch. Taking the
                // FIRST ":" found from here on would pair with the WRONG
                // "?" and silently split the expression incorrectly. Bail
                // instead — the caller leaves the original text untouched,
                // which is unsupported-but-visible, not silently wrong.
                return JSOL::dict("ok",  false);
      }
    }
    else if ($sCh === ":" && $iParenDepth === 0 && $iBracketDepth === 0 && $iQuestionIndex !== -1 && $iColonIndex === -1) {
      $iColonIndex = $i;
    }
    $i = $i + 1;
  }
  if ($iQuestionIndex === -1 || $iColonIndex === -1) {
    return JSOL::dict("ok",  false);
  }
  $sCond = $sTrimWhitespace(mb_substr($sExpr,  0,  $iQuestionIndex, "UTF-8"));
    $sTrue = $sTrimWhitespace(mb_substr($sExpr,  $iQuestionIndex + 1,  $iColonIndex - ($iQuestionIndex + 1), "UTF-8"));
    $sFalse = $sTrimWhitespace(mb_substr($sExpr,  $iColonIndex + 1,  $iLen - ($iColonIndex + 1), "UTF-8"));

    return JSOL::dict("ok",  true,  "cond",  $sCond,  "true",  $sTrue,  "false",  $sFalse);
};
$sConvertTernaries = function($sMaskedCode) use (&$bIsIdentChar2, &$iFindStatementEnd, &$mSplitTernary) {
  $sResult = "";
    $i = 0;
    $iLen = mb_strlen($sMaskedCode, "UTF-8");

    while ($i < $iLen) {
    $sCh = mb_substr($sMaskedCode,  $i,  1, "UTF-8");

        // Trigger 1: "return <expr>;"
        $bAtBoundary = ($i === 0) || ($bIsIdentChar2(mb_substr($sMaskedCode,  $i - 1,  1, "UTF-8")) === false);
        $bHandled = false;

        if ($bAtBoundary === true && mb_substr($sMaskedCode,  $i,  7, "UTF-8") === "return " && $bIsIdentChar2(mb_substr($sMaskedCode,  $i + 6,  1, "UTF-8")) === false) {
      $iRhsStart = $i + 7;
            $iStmtEnd = $iFindStatementEnd($sMaskedCode, $iRhsStart);
            $sRhs = mb_substr($sMaskedCode,  $iRhsStart,  $iStmtEnd - $iRhsStart, "UTF-8");
            $mSplit = $mSplitTernary($sRhs);

            if ($mSplit["ok"] === true) {
        $sResult = $sResult . "" . "return (" . "" . $mSplit["true"] . "" . " if " . "" . $mSplit["cond"] . "" . " else " . "" . $mSplit["false"] . "" . ")" . ";";
                $i = $iStmtEnd + 1;
                $bHandled = true;
      }
    }
    // Trigger 2: a lone "=" (assignment, not "==" / "===" / "<=" / ">=" / "!=")
        if ($bHandled === false && $sCh === "=") {
      $sPrevCh = mb_substr($sMaskedCode,  $i - 1,  1, "UTF-8");
            $sNextCh = mb_substr($sMaskedCode,  $i + 1,  1, "UTF-8");
            $bIsPlainAssign = (($sNextCh !== "=") &&
                ($sPrevCh !== "=") && ($sPrevCh !== "<") && ($sPrevCh !== ">") && ($sPrevCh !== "!"));

            if ($bIsPlainAssign === true) {
        $iRhsStart = $i + 1;
                $iStmtEnd = $iFindStatementEnd($sMaskedCode, $iRhsStart);
                $sRhs = mb_substr($sMaskedCode,  $iRhsStart,  $iStmtEnd - $iRhsStart, "UTF-8");
                $mSplit = $mSplitTernary($sRhs);

                if ($mSplit["ok"] === true) {
          $sResult = $sResult . "" . "= (" . "" . $mSplit["true"] . "" . " if " . "" . $mSplit["cond"] . "" . " else " . "" . $mSplit["false"] . "" . ")" . ";";
                    $i = $iStmtEnd + 1;
                    $bHandled = true;
        }
      }
    }
    if ($bHandled === false) {
      $sResult = $sResult . "" . $sCh;
            $i = $i + 1;
    }
  }
  return $sResult;
};
