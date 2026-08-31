declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - Python Control Flow Converter
const $saConvertControlFlowToPython = function($saMaskedCode: any): string {
  let $saResult: string = "";
    let $i: number = 0;
    const $iLen: number = Str["len"]($saMaskedCode);

    while ($i < $iLen) {
    const $saCh: string = Str["sub"]($saMaskedCode,  $i,  1);
        const $bAtBoundary: boolean = ($i === 0) || ($bIsIdentChar(Str["sub"]($saMaskedCode,  $i - 1,  1)) === false);

        if ($bAtBoundary === true && $bIsIdentChar($saCh) === true) {
      const $mWord: Record<string, any> = $mReadWord($saMaskedCode, $i);
            const $saWordStr: string = $mWord["word"];

            if ($saWordStr === "null") {
        $saResult = $saResult + "" + "None"; $i = $mWord["end"];
      }
      else if ($saWordStr === "true") {
        $saResult = $saResult + "" + "True"; $i = $mWord["end"];
      }
      else if ($saWordStr === "false") {
        $saResult = $saResult + "" + "False"; $i = $mWord["end"];
      }
      else if ($saWordStr === "if") {
        let $iAfter: number = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (Str["sub"]($saMaskedCode,  $iAfter,  1) === "(") {
          const $mParens: Record<string, any> = $mReadBalancedParens($saMaskedCode, $iAfter);
                    $saResult = $saResult + "" + "if " + "" + $saTranslateOperators($mParens["inside"]) + "" + ":";
                    $i = $mParens["end"];
        }
        else {
          $saResult = $saResult + "" + $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "switch") {
        let $iAfter: number = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (Str["sub"]($saMaskedCode,  $iAfter,  1) === "(") {
          const $mParens: Record<string, any> = $mReadBalancedParens($saMaskedCode, $iAfter);
                    const $iAfterParens: number = $iSkipWhitespace($saMaskedCode, $mParens["end"]);
                    if (Str["sub"]($saMaskedCode,  $iAfterParens,  1) === "{") {
            const $mBraces: Record<string, any> = $mReadBalancedBraces($saMaskedCode, $iAfterParens);
                        const $saBody: string = $saConvertControlFlowToPython($mBraces["inside"]);
                        $saResult = $saResult + "" + "_jsol_switch = " + "" + $saTranslateOperators($mParens["inside"]) + "" + "\n_jsol_done = False\nwhile not _jsol_done: {\n_jsol_done = True\nif False: pass" + "" + $saBody + "\n}";
                        $i = $mBraces["end"];
          }
          else {
            $saResult = $saResult + "" + "_jsol_switch = " + "" + $saTranslateOperators($mParens["inside"]) + "" + "\nif True:";
                        $i = $mParens["end"];
          }
        }
        else {
          $saResult = $saResult + "" + $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "case") {
        let $iAfter: number = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                let $bFoundColon: boolean = false;
                let $iColon: number = $iAfter;
                while ($iColon < $iLen) {
          const $saChar: string = Str["sub"]($saMaskedCode,  $iColon,  1);
                    if ($saChar === ":") {
            $bFoundColon = true; break;
          }
          if ($saChar === ";" || $saChar === "{" || $saChar === "}") {
            break;
          }
          $iColon = $iColon + 1;
        }
        if ($bFoundColon === true) {
          const $saVal: string = Str["sub"]($saMaskedCode,  $iAfter,  $iColon - $iAfter);
                    $saResult = $saResult + "" + "\nelif _jsol_switch == " + "" + $saTranslateOperators($saTrimWhitespace($saVal)) + "" + ":";
                    $i = $iColon + 1;
        }
        else {
          $saResult = $saResult + "" + $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "default") {
        let $iAfter: number = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (Str["sub"]($saMaskedCode,  $iAfter,  1) === ":") {
          $saResult = $saResult + "" + "\nelse:";
                    $i = $iAfter + 1;
        }
        else {
          $saResult = $saResult + "" + $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "else") {
        let $iAfter: number = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                const $mMaybeIf: Record<string, any> = $mReadWord($saMaskedCode, $iAfter);
                if ($mMaybeIf["word"] === "if") {
          let $iAfterIf: number = $iSkipWhitespace($saMaskedCode, $mMaybeIf["end"]);
                    if (Str["sub"]($saMaskedCode,  $iAfterIf,  1) === "(") {
            const $mParens: Record<string, any> = $mReadBalancedParens($saMaskedCode, $iAfterIf);
                        $saResult = $saResult + "" + "elif " + "" + $saTranslateOperators($mParens["inside"]) + "" + ":";
                        $i = $mParens["end"];
          }
          else {
            $saResult = $saResult + "" + "else"; $i = $mWord["end"];
          }
        }
        else if (Str["sub"]($saMaskedCode,  $iAfter,  1) === "{") {
          $saResult = $saResult + "" + "else:"; $i = $mWord["end"];
        }
        else {
          $saResult = $saResult + "" + "else"; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "while") {
        let $iAfter: number = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (Str["sub"]($saMaskedCode,  $iAfter,  1) === "(") {
          const $mParens: Record<string, any> = $mReadBalancedParens($saMaskedCode, $iAfter);
                    $saResult = $saResult + "" + "while " + "" + $saTranslateOperators($mParens["inside"]) + "" + ":";
                    $i = $mParens["end"];
        }
        else {
          $saResult = $saResult + "" + $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "for") {
        let $iAfter: number = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                if (Str["sub"]($saMaskedCode,  $iAfter,  1) === "(") {
          const $mParens: Record<string, any> = $mReadBalancedParens($saMaskedCode, $iAfter);
                    const $iAfterParens: number = $iSkipWhitespace($saMaskedCode, $mParens["end"]);
                    if (Str["sub"]($saMaskedCode,  $iAfterParens,  1) === "{") {
            const $mBraces: Record<string, any> = $mReadBalancedBraces($saMaskedCode, $iAfterParens);
                        let $saInsideParens: string = $mParens["inside"];
                        const $iSemi1: number = Str["indexOf"]($saInsideParens,  ";");
                        const $saTail1: string = Str["sub"]($saInsideParens,  $iSemi1 + 1,  Str["len"]($saInsideParens) - ($iSemi1 + 1));
                        const $iSemi2: number = Str["indexOf"]($saTail1,  ";");
                        const $saTail2: string = Str["sub"]($saTail1,  $iSemi2 + 1,  Str["len"]($saTail1) - ($iSemi2 + 1));
                        
                        let $saInit: string = $saTrimWhitespace(Str["sub"]($saInsideParens,  0,  $iSemi1));
                        if (Str["sub"]($saInit,  0,  4) === "let ") {
              $saInit = Str["sub"]($saInit,  4,  Str["len"]($saInit) - 4);
            }
            const $saCond: string = $saTrimWhitespace(Str["sub"]($saTail1,  0,  $iSemi2));
                        const $saStep: string = $saTrimWhitespace($saTail2);
                        const $saBody: string = $saConvertControlFlowToPython($mBraces["inside"]);
                        
                        $saResult = $saResult + "" + $saInit + ";\nwhile " + $saTranslateOperators($saCond) + ": {" + $saBody + "\n" + $saStep + ";\n}";
                        $i = $mBraces["end"];
          }
          else {
            $saResult = $saResult + "" + $saWordStr; $i = $mWord["end"];
          }
        }
        else {
          $saResult = $saResult + "" + $saWordStr; $i = $mWord["end"];
        }
      }
      else if ($saWordStr === "const" || $saWordStr === "let") {
        let $iAfterKw: number = $iSkipWhitespace($saMaskedCode, $mWord["end"]);
                const $mIdent: Record<string, any> = $mReadWord($saMaskedCode, $iAfterKw);
                let $iAfterIdent: number = $iSkipWhitespace($saMaskedCode, $mIdent["end"]);

                if (Str["sub"]($saMaskedCode,  $iAfterIdent,  1) === "=" && Str["sub"]($saMaskedCode,  $iAfterIdent,  2) !== "==") {
          let $iAfterEq: number = $iSkipWhitespace($saMaskedCode, $iAfterIdent + 1);
                    const $mMaybeFunc: Record<string, any> = $mReadWord($saMaskedCode, $iAfterEq);

                    if ($mMaybeFunc["word"] === "function") {
            let $iAfterFuncKw: number = $iSkipWhitespace($saMaskedCode, $mMaybeFunc["end"]);
                        if (Str["sub"]($saMaskedCode,  $iAfterFuncKw,  1) === "(") {
              const $mParams: Record<string, any> = $mReadBalancedParens($saMaskedCode, $iAfterFuncKw);
                            $saResult = $saResult + "" + "def " + "" + $mIdent["word"] + "" + "(" + "" + $mParams["inside"] + "" + "):";
                            $i = $mParams["end"];
            }
            else {
              $saResult = $saResult + "" + $mIdent["word"] + "" + " = "; $i = $iAfterEq;
            }
          }
          else {
            $saResult = $saResult + "" + $mIdent["word"] + "" + " = "; $i = $iAfterEq;
          }
        }
        else {
          $saResult = $saResult + "" + $mIdent["word"]; $i = $mIdent["end"];
        }
      }
      else {
        $saResult = $saResult + "" + $saWordStr;
                $i = $mWord["end"];
      }
    }
    else if ($saCh === "&" && Str["sub"]($saMaskedCode,  $i,  2) === "&&") {
      $saResult = $saResult + "" + "and"; $i = $i + 2;
    }
    else if ($saCh === "|" && Str["sub"]($saMaskedCode,  $i,  2) === "||") {
      $saResult = $saResult + "" + "or"; $i = $i + 2;
    }
    else if ($saCh === "=" && Str["sub"]($saMaskedCode,  $i,  3) === "===") {
      $saResult = $saResult + "" + "=="; $i = $i + 3;
    }
    else if ($saCh === "!" && Str["sub"]($saMaskedCode,  $i,  3) === "!==") {
      $saResult = $saResult + "" + "!="; $i = $i + 3;
    }
    else if ($saCh === "!" && Str["sub"]($saMaskedCode,  $i,  2) !== "!=") {
      $saResult = $saResult + "" + "not "; $i = $i + 1;
    }
    else {
      $saResult = $saResult + "" + $saCh; $i = $i + 1;
    }
  }
  return $saResult;
};
