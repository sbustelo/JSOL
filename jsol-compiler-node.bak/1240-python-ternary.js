// @JSOL v0.2.97 - Python Ternary Reorderer
const $bIsIdentChar2 = function($saCh) {
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
const $iFindStatementEnd = function($saCode, $iStart) {
  const $iLen = Str["len"]($saCode);
    let $iParenDepth = 0;
    let $iBracketDepth = 0;
    let $i = $iStart;

    while ($i < $iLen) {
    const $saCh = Str["sub"]($saCode,  $i,  1);
        if ($saCh === "(") {
      $iParenDepth = $iParenDepth + 1;
    }
    else if ($saCh === ")") {
      $iParenDepth = $iParenDepth - 1;
    }
    else if ($saCh === "[") {
      $iBracketDepth = $iBracketDepth + 1;
    }
    else if ($saCh === "]") {
      $iBracketDepth = $iBracketDepth - 1;
    }
    else if ($saCh === ";" && $iParenDepth === 0 && $iBracketDepth === 0) {
      return $i;
    }
    $i = $i + 1;
  }
  return $iLen;
};
const $mSplitTernary = function($saExpr) {
  const $iLen = Str["len"]($saExpr);
    let $iParenDepth = 0;
    let $iBracketDepth = 0;
    let $iQuestionIndex = -1;
    let $iColonIndex = -1;
    let $i = 0;

    while ($i < $iLen) {
    const $saCh = Str["sub"]($saExpr,  $i,  1);
        if ($saCh === "(") {
      $iParenDepth = $iParenDepth + 1;
    }
    else if ($saCh === ")") {
      $iParenDepth = $iParenDepth - 1;
    }
    else if ($saCh === "[") {
      $iBracketDepth = $iBracketDepth + 1;
    }
    else if ($saCh === "]") {
      $iBracketDepth = $iBracketDepth - 1;
    }
    else if ($saCh === "?" && $iParenDepth === 0 && $iBracketDepth === 0) {
      if ($iQuestionIndex === -1) {
        $iQuestionIndex = $i;
      }
      else {
        return JSOL.dict("ok",  false);
      }
    }
    else if ($saCh === ":" && $iParenDepth === 0 && $iBracketDepth === 0 && $iQuestionIndex !== -1 && $iColonIndex === -1) {
      $iColonIndex = $i;
    }
    $i = $i + 1;
  }
  if ($iQuestionIndex === -1 || $iColonIndex === -1) {
    return JSOL.dict("ok",  false);
  }
  const $saCond = $saTrimWhitespace(Str["sub"]($saExpr,  0,  $iQuestionIndex));
    const $saTrue = $saTrimWhitespace(Str["sub"]($saExpr,  $iQuestionIndex + 1,  $iColonIndex - ($iQuestionIndex + 1)));
    const $saFalse = $saTrimWhitespace(Str["sub"]($saExpr,  $iColonIndex + 1,  $iLen - ($iColonIndex + 1)));

    return JSOL.dict("ok",  true,  "cond",  $saCond,  "true",  $saTrue,  "false",  $saFalse);
};
const $saConvertTernaries = function($saMaskedCode) {
  let $saResult = "";
    let $i = 0;
    const $iLen = Str["len"]($saMaskedCode);

    while ($i < $iLen) {
    const $saCh = Str["sub"]($saMaskedCode,  $i,  1);
        const $bAtBoundary = ($i === 0) || ($bIsIdentChar2(Str["sub"]($saMaskedCode,  $i - 1,  1)) === false);
        let $bHandled = false;

        if ($bAtBoundary === true && Str["sub"]($saMaskedCode,  $i,  7) === "return " && $bIsIdentChar2(Str["sub"]($saMaskedCode,  $i + 6,  1)) === false) {
      const $iRhsStart = $i + 7;
            const $iStmtEnd = $iFindStatementEnd($saMaskedCode, $iRhsStart);
            const $saRhs = Str["sub"]($saMaskedCode,  $iRhsStart,  $iStmtEnd - $iRhsStart);
            const $mSplit = $mSplitTernary($saRhs);

            if ($mSplit["ok"] === true) {
        $saResult = $saResult + "" + "return (" + "" + $mSplit["true"] + "" + " if " + "" + $mSplit["cond"] + "" + " else " + "" + $mSplit["false"] + "" + ")" + ";";
                $i = $iStmtEnd + 1;
                $bHandled = true;
      }
    }
    if ($bHandled === false && $saCh === "=") {
      const $saPrevCh = Str["sub"]($saMaskedCode,  $i - 1,  1);
            const $saNextCh = Str["sub"]($saMaskedCode,  $i + 1,  1);
            const $bIsPlainAssign = (($saNextCh !== "=") && ($saPrevCh !== "=") && ($saPrevCh !== "<") && ($saPrevCh !== ">") && ($saPrevCh !== "!"));

            if ($bIsPlainAssign === true) {
        const $iRhsStart = $i + 1;
                const $iStmtEnd = $iFindStatementEnd($saMaskedCode, $iRhsStart);
                const $saRhs = Str["sub"]($saMaskedCode,  $iRhsStart,  $iStmtEnd - $iRhsStart);
                const $mSplit = $mSplitTernary($saRhs);

                if ($mSplit["ok"] === true) {
          $saResult = $saResult + "" + "= (" + "" + $mSplit["true"] + "" + " if " + "" + $mSplit["cond"] + "" + " else " + "" + $mSplit["false"] + "" + ")" + ";";
                    $i = $iStmtEnd + 1;
                    $bHandled = true;
        }
      }
    }
    if ($bHandled === false) {
      $saResult = $saResult + "" + $saCh;
            $i = $i + 1;
    }
  }
  return $saResult;
};
