<?php
// @JSOL v0.2.97 - Python Control Flow Converter
$saConvertControlFlowToPython = function($saMaskedCode) use (&$saConvertControlFlowToPython, &$mReadWord, &$iSkipWhitespace, &$mReadBalancedParens, &$mReadBalancedBraces, &$saTranslateOperators, &$bIsIdentChar, &$saTrimWhitespace) {
  $saResult = "";
    $i = 0;
    $iLen = mb_strlen($saMaskedCode, "UTF-8");

    while ($i < $iLen) {
    $saCh = mb_substr($saMaskedCode,  $i,  1, "UTF-8");
        $bAtBoundary = ($i === 0) || ($bIsIdentChar(mb_substr($saMaskedCode,  $i - 1,  1, "UTF-8")) === false);

        if ($bAtBoundary === true && $bIsIdentChar($saCh) === true) {
      $mWord = $mReadWord($saMaskedCode, $i);
            $saWordStr = $mWord["word"];

            if ($saWordStr === "null") {
        $saResult = $saResult . "" . "None"; $i = $mWord["end"];
      }
      else if ($saWordStr === "true") {
        $saResult = $saResult . "" . "True"; $i = $mWord["end"];
      }
      else if ($saWordStr === "false") {
        $saResult = $saResult . "" . "False"; $i = $mWord["end"];
      }
      else if ($saWordStr === "if") {
        $iAfter = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (mb_substr($saMaskedCode,  $iAfter,  1, "UTF-8") === "(") {
          $mParens = $mReadBalancedParens($saMaskedCode, $iAfter);
                    $saResult = $saResult . "" . "if " . "" . $saTranslateOperators($mParens["inside"]) . "" . ":";
                    $i = $mParens["end"];
        }
        else {
          $saResult = $saResult . "" . $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "switch") {
        $iAfter = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (mb_substr($saMaskedCode,  $iAfter,  1, "UTF-8") === "(") {
          $mParens = $mReadBalancedParens($saMaskedCode, $iAfter);
                    $iAfterParens = $iSkipWhitespace($saMaskedCode, $mParens["end"]);
                    if (mb_substr($saMaskedCode,  $iAfterParens,  1, "UTF-8") === "{") {
            $mBraces = $mReadBalancedBraces($saMaskedCode, $iAfterParens);
                        $saBody = $saConvertControlFlowToPython($mBraces["inside"]);
                        $saResult = $saResult . "" . "_jsol_switch = " . "" . $saTranslateOperators($mParens["inside"]) . "" . "\n_jsol_done = False\nwhile not _jsol_done: {\n_jsol_done = True\nif False: pass" . "" . $saBody . "\n}";
                        $i = $mBraces["end"];
          }
          else {
            $saResult = $saResult . "" . "_jsol_switch = " . "" . $saTranslateOperators($mParens["inside"]) . "" . "\nif True:";
                        $i = $mParens["end"];
          }
        }
        else {
          $saResult = $saResult . "" . $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "case") {
        $iAfter = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                $bFoundColon = false;
                $iColon = $iAfter;
                while ($iColon < $iLen) {
          $saChar = mb_substr($saMaskedCode,  $iColon,  1, "UTF-8");
                    if ($saChar === ":") {
            $bFoundColon = true; break;
          }
          if ($saChar === ";" || $saChar === "{" || $saChar === "}") {
            break;
          }
          $iColon = $iColon + 1;
        }
        if ($bFoundColon === true) {
          $saVal = mb_substr($saMaskedCode,  $iAfter,  $iColon - $iAfter, "UTF-8");
                    $saResult = $saResult . "" . "\nelif _jsol_switch == " . "" . $saTranslateOperators($saTrimWhitespace($saVal)) . "" . ":";
                    $i = $iColon + 1;
        }
        else {
          $saResult = $saResult . "" . $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "default") {
        $iAfter = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (mb_substr($saMaskedCode,  $iAfter,  1, "UTF-8") === ":") {
          $saResult = $saResult . "" . "\nelse:";
                    $i = $iAfter + 1;
        }
        else {
          $saResult = $saResult . "" . $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "else") {
        $iAfter = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                $mMaybeIf = $mReadWord($saMaskedCode, $iAfter);
                if ($mMaybeIf["word"] === "if") {
          $iAfterIf = $iSkipWhitespace($saMaskedCode, $mMaybeIf["end"]);
                    if (mb_substr($saMaskedCode,  $iAfterIf,  1, "UTF-8") === "(") {
            $mParens = $mReadBalancedParens($saMaskedCode, $iAfterIf);
                        $saResult = $saResult . "" . "elif " . "" . $saTranslateOperators($mParens["inside"]) . "" . ":";
                        $i = $mParens["end"];
          }
          else {
            $saResult = $saResult . "" . "else"; $i = $mWord["end"];
          }
        }
        else if (mb_substr($saMaskedCode,  $iAfter,  1, "UTF-8") === "{") {
          $saResult = $saResult . "" . "else:"; $i = $mWord["end"];
        }
        else {
          $saResult = $saResult . "" . "else"; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "while") {
        $iAfter = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (mb_substr($saMaskedCode,  $iAfter,  1, "UTF-8") === "(") {
          $mParens = $mReadBalancedParens($saMaskedCode, $iAfter);
                    $saResult = $saResult . "" . "while " . "" . $saTranslateOperators($mParens["inside"]) . "" . ":";
                    $i = $mParens["end"];
        }
        else {
          $saResult = $saResult . "" . $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "for") {
        $iAfter = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (mb_substr($saMaskedCode,  $iAfter,  1, "UTF-8") === "(") {
          $mParens = $mReadBalancedParens($saMaskedCode, $iAfter);
                    $iAfterParens = $iSkipWhitespace($saMaskedCode, $mParens["end"]);
                    if (mb_substr($saMaskedCode,  $iAfterParens,  1, "UTF-8") === "{") {
            $mBraces = $mReadBalancedBraces($saMaskedCode, $iAfterParens);
                        $saInsideParens = $mParens["inside"];
                        $iSemi1 = Str::indexOf($saInsideParens,  ";");
                        $saTail1 = mb_substr($saInsideParens,  $iSemi1 + 1,  mb_strlen($saInsideParens, "UTF-8") - ($iSemi1 + 1), "UTF-8");
                        $iSemi2 = Str::indexOf($saTail1,  ";");
                        $saTail2 = mb_substr($saTail1,  $iSemi2 + 1,  mb_strlen($saTail1, "UTF-8") - ($iSemi2 + 1), "UTF-8");
                        
                        $saInit = $saTrimWhitespace(mb_substr($saInsideParens,  0,  $iSemi1, "UTF-8"));
                        if (mb_substr($saInit,  0,  4, "UTF-8") === "let ") {
              $saInit = mb_substr($saInit,  4,  mb_strlen($saInit, "UTF-8") - 4, "UTF-8");
            }
            $saCond = $saTrimWhitespace(mb_substr($saTail1,  0,  $iSemi2, "UTF-8"));
                        $saStep = $saTrimWhitespace($saTail2);
                        $saBody = $saConvertControlFlowToPython($mBraces["inside"]);
                        
                        $saResult = $saResult . "" . $saInit . ";\nwhile " . $saTranslateOperators($saCond) . ": {" . $saBody . "\n" . $saStep . ";\n}";
                        $i = $mBraces["end"];
          }
          else {
            $saResult = $saResult . "" . $saWordStr; $i = $mWord["end"];
          }
        }
        else {
          $saResult = $saResult . "" . $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "const" || $saWordStr === "let") {
        $iAfterKw = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                $mIdent = $mReadWord($saMaskedCode, $iAfterKw);
                $iAfterIdent = $iSkipWhitespace($saMaskedCode, $mIdent["end"]);

                if (mb_substr($saMaskedCode,  $iAfterIdent,  1, "UTF-8") === "=" && mb_substr($saMaskedCode,  $iAfterIdent,  2, "UTF-8") !== "==") {
          $iAfterEq = $iSkipWhitespace($saMaskedCode, $iAfterIdent + 1);
                    $mMaybeFunc = $mReadWord($saMaskedCode, $iAfterEq);

                    if ($mMaybeFunc["word"] === "function") {
            $iAfterFuncKw = $iSkipWhitespace($saMaskedCode, $mMaybeFunc["end"]);
                        if (mb_substr($saMaskedCode,  $iAfterFuncKw,  1, "UTF-8") === "(") {
              $mParams = $mReadBalancedParens($saMaskedCode, $iAfterFuncKw);
                            $saResult = $saResult . "" . "def " . "" . $mIdent["word"] . "" . "(" . "" . $mParams["inside"] . "" . "):";
                            $i = $mParams["end"];
            }
            else {
              $saResult = $saResult . "" . $mIdent["word"] . "" . " = "; $i = $iAfterEq;
            }
          }
          else {
            $saResult = $saResult . "" . $mIdent["word"] . "" . " = "; $i = $iAfterEq;
          }
        }
        else {
          $saResult = $saResult . "" . $mIdent["word"]; $i = $mIdent["end"];
        }
      }
      else {
        $saResult = $saResult . "" . $saWordStr;
                $i = $mWord["end"];
      }
    }
    else if ($saCh === "&" && mb_substr($saMaskedCode,  $i,  2, "UTF-8") === "&&") {
      $saResult = $saResult . "" . "and"; $i = $i + 2;
    }
    else if ($saCh === "|" && mb_substr($saMaskedCode,  $i,  2, "UTF-8") === "||") {
      $saResult = $saResult . "" . "or"; $i = $i + 2;
    }
    else if ($saCh === "=" && mb_substr($saMaskedCode,  $i,  3, "UTF-8") === "===") {
      $saResult = $saResult . "" . "=="; $i = $i + 3;
    }
    else if ($saCh === "!" && mb_substr($saMaskedCode,  $i,  3, "UTF-8") === "!==") {
      $saResult = $saResult . "" . "!="; $i = $i + 3;
    }
    else if ($saCh === "!" && mb_substr($saMaskedCode,  $i,  2, "UTF-8") !== "!=") {
      $saResult = $saResult . "" . "not "; $i = $i + 1;
    }
    else {
      $saResult = $saResult . "" . $saCh; $i = $i + 1;
    }
  }
  return $saResult;
};
