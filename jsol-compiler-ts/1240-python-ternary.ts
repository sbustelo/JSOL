declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - Python Ternary Reorderer
const $bIsIdentChar2 = function($saCh: any): boolean {
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
const $iFindStatementEnd = function($saCode: any, $iStart: any): number {
  const $iLen: number = Str["len"]($saCode);
    let $iParenDepth: number = 0;
    let $iBracketDepth: number = 0;
    let $i: number = $iStart;

    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saCode,  $i,  1);
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
const $mSplitTernary = function($saExpr: any): Record<string, any> {
  const $iLen: number = Str["len"]($saExpr);
    let $iParenDepth: number = 0;
    let $iBracketDepth: number = 0;
    let $iQuestionIndex: number = -1;
    let $iColonIndex: number = -1;
    let $i: number = 0;

    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saExpr,  $i,  1);
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
  const $saCond: string = $saTrimWhitespace(Str["sub"]($saExpr,  0,  $iQuestionIndex));
    const $saTrue: string = $saTrimWhitespace(Str["sub"]($saExpr,  $iQuestionIndex + 1,  $iColonIndex - ($iQuestionIndex + 1)));
    const $saFalse: string = $saTrimWhitespace(Str["sub"]($saExpr,  $iColonIndex + 1,  $iLen - ($iColonIndex + 1)));

    return JSOL.dict("ok",  true,  "cond",  $saCond,  "true",  $saTrue,  "false",  $saFalse);
};
const $saConvertTernaries = function($saMaskedCode: any): string {
  let $saResult: string = "";
    let $i: number = 0;
    const $iLen: number = Str["len"]($saMaskedCode);

    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saMaskedCode,  $i,  1);
        const $bAtBoundary: boolean = ($i === 0) || ($bIsIdentChar2(Str["sub"]($saMaskedCode,  $i - 1,  1)) === false);
        let $bHandled: boolean = false;

        if ($bAtBoundary === true && Str["sub"]($saMaskedCode,  $i,  7) === "return " && $bIsIdentChar2(Str["sub"]($saMaskedCode,  $i + 6,  1)) === false) {
      const $iRhsStart: number = $i + 7;
            const $iStmtEnd: number = $iFindStatementEnd($saMaskedCode, $iRhsStart);
            const $saRhs: string = Str["sub"]($saMaskedCode,  $iRhsStart,  $iStmtEnd - $iRhsStart);
            const $mSplit: Record<string, any> = $mSplitTernary($saRhs);

            if ($mSplit["ok"] === true) {
        $saResult = $saResult + "" + "return (" + "" + $mSplit["true"] + "" + " if " + "" + $mSplit["cond"] + "" + " else " + "" + $mSplit["false"] + "" + ")" + ";";
                $i = $iStmtEnd + 1;
                $bHandled = true;
      }
    }
    if ($bHandled === false && $saCh === "=") {
      const $saPrevCh: string = Str["sub"]($saMaskedCode,  $i - 1,  1);
            const $saNextCh: string = Str["sub"]($saMaskedCode,  $i + 1,  1);
            const $bIsPlainAssign: boolean = (($saNextCh !== "=") && ($saPrevCh !== "=") && ($saPrevCh !== "<") && ($saPrevCh !== ">") && ($saPrevCh !== "!"));

            if ($bIsPlainAssign === true) {
        const $iRhsStart: number = $i + 1;
                const $iStmtEnd: number = $iFindStatementEnd($saMaskedCode, $iRhsStart);
                const $saRhs: string = Str["sub"]($saMaskedCode,  $iRhsStart,  $iStmtEnd - $iRhsStart);
                const $mSplit: Record<string, any> = $mSplitTernary($saRhs);

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
