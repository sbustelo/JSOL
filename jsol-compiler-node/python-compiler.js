
// @JSOL v0.2.96 - Python Target Compiler
// [!] ARCHITECTURE NOTICE: This Python target compiler has a direct structural dependency on 
// js-compiler.jsol. It expects the source code to have passed through the JavaScript base 
// transformations (like ternary and brace stripping) before applying Python-specific rules.
//
// Runs on MASKED code, AFTER $sCompileToJS(..., pythonRules) has already
// substituted primitives (Str.*, Arr.*, Map.*, Cast.*), and BEFORE $sIndentCode.
//
// Scope: translates JS-shaped control-flow syntax to Python syntax, but
// DELIBERATELY LEAVES EVERY "{" AND "}" IN PLACE. $sIndentCode depends on
// brace-depth counting to indent correctly; stripping braces here would blind
// it. Braces get removed in a LATER, separate pass, only after indentation is
// already resolved and they're pure noise.
//
// Handled in this pass:
//   - Operators: && -> and, || -> or, ! -> not (word-boundary safe, doesn't
//     touch "!=" or "!==" ), === -> ==, !== -> !=
//   - Keywords: null -> None, true -> True, false -> False (word-boundary safe)
//   - if (cond) {      -> if cond: {
//   - else if (cond) { -> elif cond: {
//   - else {           -> else: {
//   - while (cond) {   -> while cond: {
//   - switch (cond) {  -> converts to while loop with elif chain
//   - for (init; cond; step) { -> converts to while loop mathematically
//
// NOT handled in this pass, on purpose (separate, harder problem):
//   - Ternary (cond ? a : b) -> (a if cond else b)
//
// Usage: standalone first, same discipline as indenter.jsol. Do not wire into
// engine.jsol until validated against real examples.


const $aTranslateCommentTokensToPython = function($aTokens) {
  let $aResult = [];
    for (let $i = 0; $i < $aTokens.length; $i = $i + 1) {
    const $mToken = $aTokens[$i];
        const $sKey = $mToken["key"];
        const $sVal = $mToken["value"];

        if ($sVal.substring( 0, ( 0) + ( 2)) === "//") {
      const $sRest = $sVal.substring( 2, ( 2) + ( $sVal.length - 2));
            $aResult.push( JSOL.dict("key",  $sKey,  "value",  "#" + "" + $sRest));
    }
    else if ($sVal.substring( 0, ( 0) + ( 2)) === "/*") {
      let $sInner = $sVal.substring( 2, ( 2) + ( $sVal.length - 2));
            if ($sInner.substring( $sInner.length - 2, ( $sInner.length - 2) + ( 2)) === "*/") {
        $sInner = $sInner.substring( 0, ( 0) + ( $sInner.length - 2));
      }
      const $sConverted = "#" + "" + $sInner.split( "\n").join( "\n#");
            $aResult.push( JSOL.dict("key",  $sKey,  "value",  $sConverted));
    }
    else {
      // Not a comment (starts with a quote char) — a real string
            // literal, leave it byte-for-byte untouched.
            $aResult.push( JSOL.dict("key",  $sKey,  "value",  $sVal));
    }
  }
  return $aResult;
};
const $bIsWhitespaceCharTrim = function($sCh) {
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
const $sTrimWhitespace = function($sVal) {
  const $iLen = $sVal.length;
    let $iStart = 0;
    while ($iStart < $iLen && $bIsWhitespaceCharTrim($sVal.substring( $iStart, ( $iStart) + ( 1))) === true) {
    $iStart = $iStart + 1;
  }
  let $iEnd = $iLen;
    while ($iEnd > $iStart && $bIsWhitespaceCharTrim($sVal.substring( $iEnd - 1, ( $iEnd - 1) + ( 1))) === true) {
    $iEnd = $iEnd - 1;
  }
  return $sVal.substring( $iStart, ( $iStart) + ( $iEnd - $iStart));
};
const $bIsIdentChar = function($sCh) {
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
const $mReadWord = function($sCode, $iStart) {
  const $iLen = $sCode.length;
    let $i = $iStart;
    while ($i < $iLen && $bIsIdentChar($sCode.substring( $i, ( $i) + ( 1))) === true) {
    $i = $i + 1;
  }
  return JSOL.dict("word",  $sCode.substring( $iStart, ( $iStart) + ( $i - $iStart)),  "end",  $i);
};
const $iSkipWhitespace = function($sCode, $iStart) {
  const $iLen = $sCode.length;
    let $i = $iStart;
    while ($i < $iLen) {
    const $sCh = $sCode.substring( $i, ( $i) + ( 1));
        if ($sCh === " " || $sCh === "\t" || $sCh === "\n" || $sCh === "\r") {
      $i = $i + 1;
    }
    else {
      return $i;
    }
  }
  return $i;
};
const $mReadBalancedParens = function($sCode, $iOpenIndex) {
  const $iLen = $sCode.length;
    let $iDepth = 0;
    let $i = $iOpenIndex;
    let $iInsideStart = -1;

    while ($i < $iLen) {
    const $sCh = $sCode.substring( $i, ( $i) + ( 1));
        if ($sCh === "(") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($sCh === ")") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL.dict(
                    "inside",  $sCode.substring( $iInsideStart, ( $iInsideStart) + ( $i - $iInsideStart)), 
                    "end",  $i + 1
                );
      }
    }
    $i = $i + 1;
  }
  return JSOL.dict("inside",  "",  "end",  $iLen);
};
const $sTranslateOperators = function($sExpr) {
  let $sResult = "";
    let $i = 0;
    const $iLen = $sExpr.length;

    while ($i < $iLen) {
    const $sCh = $sExpr.substring( $i, ( $i) + ( 1));
        const $bAtBoundary = ($i === 0) || ($bIsIdentChar($sExpr.substring( $i - 1, ( $i - 1) + ( 1))) === false);

        if ($bAtBoundary === true && $bIsIdentChar($sCh) === true) {
      const $mWord = $mReadWord($sExpr, $i);
            const $sWord = $mWord["word"];

            if ($sWord === "true") {
        $sResult = $sResult + "" + "True";
                $i = $mWord["end"];
      }
      else if ($sWord === "false") {
        $sResult = $sResult + "" + "False";
                $i = $mWord["end"];
      }
      else if ($sWord === "null") {
        $sResult = $sResult + "" + "None";
                $i = $mWord["end"];
      }
      else {
        $sResult = $sResult + "" + $sWord;
                $i = $mWord["end"];
      }
    }
    else {
      const $sTwo = $sExpr.substring( $i, ( $i) + ( 2));
            const $sThree = $sExpr.substring( $i, ( $i) + ( 3));

            if ($sThree === "===") {
        $sResult = $sResult + "" + "==";
                $i = $i + 3;
      }
      else if ($sThree === "!==") {
        $sResult = $sResult + "" + "!=";
                $i = $i + 3;
      }
      else if ($sTwo === "&&") {
        $sResult = $sResult + "" + "and";
                $i = $i + 2;
      }
      else if ($sTwo === "||") {
        $sResult = $sResult + "" + "or";
                $i = $i + 2;
      }
      else if ($sTwo === "!=") {
        $sResult = $sResult + "" + "!=";
                $i = $i + 2;
      }
      else if ($sExpr.substring( $i, ( $i) + ( 1)) === "!") {
        $sResult = $sResult + "" + "not ";
                $i = $i + 1;
      }
      else {
        $sResult = $sResult + "" + $sCh;
                $i = $i + 1;
      }
    }
  }
  return $sResult;
};
const $mReadBalancedBraces = function($sCode, $iOpenIndex) {
  const $iLen = $sCode.length;
    let $iDepth = 0;
    let $i = $iOpenIndex;
    let $iInsideStart = -1;
    while ($i < $iLen) {
    const $sCh = $sCode.substring( $i, ( $i) + ( 1));
        if ($sCh === "{") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($sCh === "}") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL.dict("inside",  $sCode.substring( $iInsideStart, ( $iInsideStart) + ( $i - $iInsideStart)),  "end",  $i + 1);
      }
    }
    $i = $i + 1;
  }
  return JSOL.dict("inside",  "",  "end",  $iLen);
};
const $sConvertControlFlowToPython = function($sMaskedCode) {
  let $sResult = "";
    let $i = 0;
    const $iLen = $sMaskedCode.length;

    while ($i < $iLen) {
    const $sCh = $sMaskedCode.substring( $i, ( $i) + ( 1));
        const $bAtBoundary = ($i === 0) || ($bIsIdentChar($sMaskedCode.substring( $i - 1, ( $i - 1) + ( 1))) === false);

        if ($bAtBoundary === true && $bIsIdentChar($sCh) === true) {
      const $mWord = $mReadWord($sMaskedCode, $i);
            const $sWord = $mWord["word"];

            if ($sWord === "null") {
        $sResult = $sResult + "" + "None";
                $i = $mWord["end"];
      }
      else if ($sWord === "true") {
        $sResult = $sResult + "" + "True";
                $i = $mWord["end"];
      }
      else if ($sWord === "false") {
        $sResult = $sResult + "" + "False";
                $i = $mWord["end"];
      }
      else if ($sWord === "if") {
        let $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if ($sMaskedCode.substring( $iAfter, ( $iAfter) + ( 1)) === "(") {
          const $mParens = $mReadBalancedParens($sMaskedCode, $iAfter);
                    $sResult = $sResult + "" + "if " + "" + $sTranslateOperators($mParens["inside"]) + "" + ":";
                    $i = $mParens["end"];
        }
        else {
          $sResult = $sResult + "" + $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "switch") {
        let $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if ($sMaskedCode.substring( $iAfter, ( $iAfter) + ( 1)) === "(") {
          const $mParens = $mReadBalancedParens($sMaskedCode, $iAfter);
                    const $iAfterParens = $iSkipWhitespace($sMaskedCode, $mParens["end"]);
                    if ($sMaskedCode.substring( $iAfterParens, ( $iAfterParens) + ( 1)) === "{") {
            const $mBraces = $mReadBalancedBraces($sMaskedCode, $iAfterParens);
                        const $sBody = $sConvertControlFlowToPython($mBraces["inside"]);
                        $sResult = $sResult + "" + "_jsol_switch = " + "" + $sTranslateOperators($mParens["inside"]) + "" + "\n_jsol_done = False\nwhile not _jsol_done: {\n_jsol_done = True\nif False: pass" + "" + $sBody + "\n}";
                        $i = $mBraces["end"];
          }
          else {
            $sResult = $sResult + "" + "_jsol_switch = " + "" + $sTranslateOperators($mParens["inside"]) + "" + "\nif True:";
                        $i = $mParens["end"];
          }
        }
        else {
          $sResult = $sResult + "" + $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "case") {
        let $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                let $bFoundColon = false;
                let $iColon = $iAfter;
                while ($iColon < $iLen) {
          const $sChar = $sMaskedCode.substring( $iColon, ( $iColon) + ( 1));
                    if ($sChar === ":") {
            $bFoundColon = true;
                        break;
          }
          if ($sChar === ";" || $sChar === "{" || $sChar === "}") {
            break;
          }
          $iColon = $iColon + 1;
        }
        if ($bFoundColon === true) {
          const $sVal = $sMaskedCode.substring( $iAfter, ( $iAfter) + ( $iColon - $iAfter));
                    $sResult = $sResult + "" + "\nelif _jsol_switch == " + "" + $sTranslateOperators($sTrimWhitespace($sVal)) + "" + ":";
                    $i = $iColon + 1;
        }
        else {
          $sResult = $sResult + "" + $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "default") {
        let $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if ($sMaskedCode.substring( $iAfter, ( $iAfter) + ( 1)) === ":") {
          $sResult = $sResult + "" + "\nelse:";
                    $i = $iAfter + 1;
        }
        else {
          $sResult = $sResult + "" + $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "else") {
        let $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                const $mMaybeIf = $mReadWord($sMaskedCode, $iAfter);
                if ($mMaybeIf["word"] === "if") {
          let $iAfterIf = $iSkipWhitespace($sMaskedCode, $mMaybeIf["end"]);
                    if ($sMaskedCode.substring( $iAfterIf, ( $iAfterIf) + ( 1)) === "(") {
            const $mParens = $mReadBalancedParens($sMaskedCode, $iAfterIf);
                        $sResult = $sResult + "" + "elif " + "" + $sTranslateOperators($mParens["inside"]) + "" + ":";
                        $i = $mParens["end"];
          }
          else {
            $sResult = $sResult + "" + "else";
                        $i = $mWord["end"];
          }
        }
        else if ($sMaskedCode.substring( $iAfter, ( $iAfter) + ( 1)) === "{") {
          $sResult = $sResult + "" + "else:";
                    $i = $mWord["end"];
        }
        else {
          $sResult = $sResult + "" + "else";
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "while") {
        let $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if ($sMaskedCode.substring( $iAfter, ( $iAfter) + ( 1)) === "(") {
          const $mParens = $mReadBalancedParens($sMaskedCode, $iAfter);
                    $sResult = $sResult + "" + "while " + "" + $sTranslateOperators($mParens["inside"]) + "" + ":";
                    $i = $mParens["end"];
        }
        else {
          $sResult = $sResult + "" + $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "for") {
        let $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if ($sMaskedCode.substring( $iAfter, ( $iAfter) + ( 1)) === "(") {
          const $mParens = $mReadBalancedParens($sMaskedCode, $iAfter);
                    const $iAfterParens = $iSkipWhitespace($sMaskedCode, $mParens["end"]);
                    if ($sMaskedCode.substring( $iAfterParens, ( $iAfterParens) + ( 1)) === "{") {
            const $mBraces = $mReadBalancedBraces($sMaskedCode, $iAfterParens);
                        
                        let $sInsideParens = $mParens["inside"];
                        const $iSemi1 = $sInsideParens.indexOf( ";");
                        const $sTail1 = $sInsideParens.substring( $iSemi1 + 1, ( $iSemi1 + 1) + ( $sInsideParens.length - ($iSemi1 + 1)));
                        const $iSemi2 = $sTail1.indexOf( ";");
                        const $sTail2 = $sTail1.substring( $iSemi2 + 1, ( $iSemi2 + 1) + ( $sTail1.length - ($iSemi2 + 1)));
                        
                        let $sInit = $sTrimWhitespace($sInsideParens.substring( 0, ( 0) + ( $iSemi1)));
                        if ($sInit.substring( 0, ( 0) + ( 4)) === "let ") {
              $sInit = $sInit.substring( 4, ( 4) + ( $sInit.length - 4));
            }
            const $sCond = $sTrimWhitespace($sTail1.substring( 0, ( 0) + ( $iSemi2)));
                        const $sStep = $sTrimWhitespace($sTail2);
                        
                        const $sBody = $sConvertControlFlowToPython($mBraces["inside"]);
                        
                        $sResult = $sResult + "" + $sInit + ";\nwhile " + $sTranslateOperators($sCond) + ": {" + $sBody + "\n" + $sStep + ";\n}";
                        $i = $mBraces["end"];
          }
          else {
            $sResult = $sResult + "" + $sWord;
                        $i = $mWord["end"];
          }
        }
        else {
          $sResult = $sResult + "" + $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "const" || $sWord === "let") {
        let $iAfterKw = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                const $mIdent = $mReadWord($sMaskedCode, $iAfterKw);
                let $iAfterIdent = $iSkipWhitespace($sMaskedCode, $mIdent["end"]);

                if ($sMaskedCode.substring( $iAfterIdent, ( $iAfterIdent) + ( 1)) === "=" && $sMaskedCode.substring( $iAfterIdent, ( $iAfterIdent) + ( 2)) !== "==") {
          let $iAfterEq = $iSkipWhitespace($sMaskedCode, $iAfterIdent + 1);
                    const $mMaybeFunc = $mReadWord($sMaskedCode, $iAfterEq);

                    if ($mMaybeFunc["word"] === "function") {
            let $iAfterFuncKw = $iSkipWhitespace($sMaskedCode, $mMaybeFunc["end"]);
                        if ($sMaskedCode.substring( $iAfterFuncKw, ( $iAfterFuncKw) + ( 1)) === "(") {
              const $mParams = $mReadBalancedParens($sMaskedCode, $iAfterFuncKw);
                            $sResult = $sResult + "" + "def " + "" + $mIdent["word"] + "" + "(" + "" + $mParams["inside"] + "" + "):";
                            $i = $mParams["end"];
            }
            else {
              $sResult = $sResult + "" + $mIdent["word"] + "" + " = ";
                            $i = $iAfterEq;
            }
          }
          else {
            $sResult = $sResult + "" + $mIdent["word"] + "" + " = ";
                        $i = $iAfterEq;
          }
        }
        else {
          $sResult = $sResult + "" + $mIdent["word"];
                    $i = $mIdent["end"];
        }
      }
      else {
        $sResult = $sResult + "" + $sWord;
                $i = $mWord["end"];
      }
    }
    else if ($sCh === "&" && $sMaskedCode.substring( $i, ( $i) + ( 2)) === "&&") {
      $sResult = $sResult + "" + "and";
            $i = $i + 2;
    }
    else if ($sCh === "|" && $sMaskedCode.substring( $i, ( $i) + ( 2)) === "||") {
      $sResult = $sResult + "" + "or";
            $i = $i + 2;
    }
    else if ($sCh === "=" && $sMaskedCode.substring( $i, ( $i) + ( 3)) === "===") {
      $sResult = $sResult + "" + "==";
            $i = $i + 3;
    }
    else if ($sCh === "!" && $sMaskedCode.substring( $i, ( $i) + ( 3)) === "!==") {
      $sResult = $sResult + "" + "!=";
            $i = $i + 3;
    }
    else if ($sCh === "!" && $sMaskedCode.substring( $i, ( $i) + ( 2)) !== "!=") {
      $sResult = $sResult + "" + "not ";
            $i = $i + 1;
    }
    else {
      $sResult = $sResult + "" + $sCh;
            $i = $i + 1;
    }
  }
  return $sResult;
};
const $sSanitizePythonIdentifiers = function($sMaskedCode) {
  const $bIsIdentChar = function($sCh) {
    if ($sCh === "_") {
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
  // Python 3 hard keywords. Nunca pueden ser identificadores, sin excepcion.
    const $aPyKeywords = [
        "False", "None", "True", "and", "as", "assert", "async", "await",
        "break", "class", "continue", "def", "del", "elif", "else", "except",
        "finally", "for", "from", "global", "if", "import", "in", "is",
        "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
        "try", "while", "with", "yield"
    ];

    // Builtins de uso frecuente que un nombre de variable de negocio puede
    // pisar una vez removido el prefijo tipado (ej. $str, $map, $type, $id).
    const $aPyBuiltins = [
        "str", "int", "float", "bool", "list", "dict", "set", "tuple",
        "type", "id", "len", "map", "filter", "sum", "min", "max",
        "sorted", "input", "print", "format", "object", "super", "next",
        "iter", "hash", "range", "repr", "slice", "zip", "vars", "dir",
        "open", "eval", "exec", "abs", "all", "any", "bin", "chr", "ord",
        "hex", "oct", "pow", "round", "property", "staticmethod", "classmethod"
    ];

    let $sResult = "";
    const $iLen = $sMaskedCode.length;
    let $i = 0;
    while ($i < $iLen) {
    const $sCh = $sMaskedCode.substring( $i, ( $i) + ( 1));
        if ($sCh === "$") {
      let $iJ = $i + 1;
            while ($iJ < $iLen && $bIsIdentChar($sMaskedCode.substring( $iJ, ( $iJ) + ( 1))) === true) {
        $iJ = $iJ + 1;
      }
      let $sName = $sMaskedCode.substring( $i + 1, ( $i + 1) + ( $iJ - $i - 1));
            if ($aPyKeywords.indexOf( $sName) !== -1 || $aPyBuiltins.indexOf( $sName) !== -1) {
        $sName = $sName + "_";
      }
      // Estado original puro: NO SE AGREGA EL GUION BAJO
            $sResult = $sResult + "" + $sName;
            $i = $iJ;
    }
    else {
      $sResult = $sResult + "" + $sCh;
            $i = $i + 1;
    }
  }
  return $sResult;
};
