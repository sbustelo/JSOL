<?php
// @JSOL v0.2.97 - Python Ternary Reorderer
$bIsIdentChar2 = function($saCh) {
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
$iFindStatementEnd = function($saCode, $iStart) {
  $iLen = mb_strlen($saCode, "UTF-8");
    $iParenDepth = 0;
    $iBracketDepth = 0;
    $i = $iStart;

    while ($i < $iLen) {
    $saCh = mb_substr($saCode,  $i,  1, "UTF-8");
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
$mSplitTernary = function($saExpr) use (&$saTrimWhitespace) {
  $iLen = mb_strlen($saExpr, "UTF-8");
    $iParenDepth = 0;
    $iBracketDepth = 0;
    $iQuestionIndex = -1;
    $iColonIndex = -1;
    $i = 0;

    while ($i < $iLen) {
    $saCh = mb_substr($saExpr,  $i,  1, "UTF-8");
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
        return JSOL::dict("ok",  false);
      }
    }
    else if ($saCh === ":" && $iParenDepth === 0 && $iBracketDepth === 0 && $iQuestionIndex !== -1 && $iColonIndex === -1) {
      $iColonIndex = $i;
    }
    $i = $i + 1;
  }
  if ($iQuestionIndex === -1 || $iColonIndex === -1) {
    return JSOL::dict("ok",  false);
  }
  $saCond = $saTrimWhitespace(mb_substr($saExpr,  0,  $iQuestionIndex, "UTF-8"));
    $saTrue = $saTrimWhitespace(mb_substr($saExpr,  $iQuestionIndex + 1,  $iColonIndex - ($iQuestionIndex + 1), "UTF-8"));
    $saFalse = $saTrimWhitespace(mb_substr($saExpr,  $iColonIndex + 1,  $iLen - ($iColonIndex + 1), "UTF-8"));

    return JSOL::dict("ok",  true,  "cond",  $saCond,  "true",  $saTrue,  "false",  $saFalse);
};
$saConvertTernaries = function($saMaskedCode) use (&$bIsIdentChar2, &$iFindStatementEnd, &$mSplitTernary) {
  $saResult = "";
    $i = 0;
    $iLen = mb_strlen($saMaskedCode, "UTF-8");

    while ($i < $iLen) {
    $saCh = mb_substr($saMaskedCode,  $i,  1, "UTF-8");
        $bAtBoundary = ($i === 0) || ($bIsIdentChar2(mb_substr($saMaskedCode,  $i - 1,  1, "UTF-8")) === false);
        $bHandled = false;

        if ($bAtBoundary === true && mb_substr($saMaskedCode,  $i,  7, "UTF-8") === "return " && $bIsIdentChar2(mb_substr($saMaskedCode,  $i + 6,  1, "UTF-8")) === false) {
      $iRhsStart = $i + 7;
            $iStmtEnd = $iFindStatementEnd($saMaskedCode, $iRhsStart);
            $saRhs = mb_substr($saMaskedCode,  $iRhsStart,  $iStmtEnd - $iRhsStart, "UTF-8");
            $mSplit = $mSplitTernary($saRhs);

            if ($mSplit["ok"] === true) {
        $saResult = $saResult . "" . "return (" . "" . $mSplit["true"] . "" . " if " . "" . $mSplit["cond"] . "" . " else " . "" . $mSplit["false"] . "" . ")" . ";";
                $i = $iStmtEnd + 1;
                $bHandled = true;
      }
    }
    if ($bHandled === false && $saCh === "=") {
      $saPrevCh = mb_substr($saMaskedCode,  $i - 1,  1, "UTF-8");
            $saNextCh = mb_substr($saMaskedCode,  $i + 1,  1, "UTF-8");
            $bIsPlainAssign = (($saNextCh !== "=") && ($saPrevCh !== "=") && ($saPrevCh !== "<") && ($saPrevCh !== ">") && ($saPrevCh !== "!"));

            if ($bIsPlainAssign === true) {
        $iRhsStart = $i + 1;
                $iStmtEnd = $iFindStatementEnd($saMaskedCode, $iRhsStart);
                $saRhs = mb_substr($saMaskedCode,  $iRhsStart,  $iStmtEnd - $iRhsStart, "UTF-8");
                $mSplit = $mSplitTernary($saRhs);

                if ($mSplit["ok"] === true) {
          $saResult = $saResult . "" . "= (" . "" . $mSplit["true"] . "" . " if " . "" . $mSplit["cond"] . "" . " else " . "" . $mSplit["false"] . "" . ")" . ";";
                    $i = $iStmtEnd + 1;
                    $bHandled = true;
        }
      }
    }
    if ($bHandled === false) {
      $saResult = $saResult . "" . $saCh;
            $i = $i + 1;
    }
  }
  return $saResult;
};
