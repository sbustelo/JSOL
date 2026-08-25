<?php

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


$aTranslateCommentTokensToPython = function($aTokens) {
  $aResult = [];
    for ($i = 0; $i < count($aTokens); $i = $i + 1) {
    $mToken = $aTokens[$i];
        $sKey = $mToken["key"];
        $sVal = $mToken["value"];

        if (mb_substr($sVal,  0,  2, "UTF-8") === "//") {
      $sRest = mb_substr($sVal,  2,  mb_strlen($sVal, "UTF-8") - 2, "UTF-8");
            $aResult[] =  JSOL::dict("key",  $sKey,  "value",  "#" . "" . $sRest);
    }
    else if (mb_substr($sVal,  0,  2, "UTF-8") === "/*") {
      $sInner = mb_substr($sVal,  2,  mb_strlen($sVal, "UTF-8") - 2, "UTF-8");
            if (mb_substr($sInner,  mb_strlen($sInner, "UTF-8") - 2,  2, "UTF-8") === "*/") {
        $sInner = mb_substr($sInner,  0,  mb_strlen($sInner, "UTF-8") - 2, "UTF-8");
      }
      $sConverted = "#" . "" . str_replace( "\n",  "\n#", $sInner);
            $aResult[] =  JSOL::dict("key",  $sKey,  "value",  $sConverted);
    }
    else {
      // Not a comment (starts with a quote char) — a real string
            // literal, leave it byte-for-byte untouched.
            $aResult[] =  JSOL::dict("key",  $sKey,  "value",  $sVal);
    }
  }
  return $aResult;
};
$bIsWhitespaceCharTrim = function($sCh) {
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
$sTrimWhitespace = function($sVal) use (&$bIsWhitespaceCharTrim) {
  $iLen = mb_strlen($sVal, "UTF-8");
    $iStart = 0;
    while ($iStart < $iLen && $bIsWhitespaceCharTrim(mb_substr($sVal,  $iStart,  1, "UTF-8")) === true) {
    $iStart = $iStart + 1;
  }
  $iEnd = $iLen;
    while ($iEnd > $iStart && $bIsWhitespaceCharTrim(mb_substr($sVal,  $iEnd - 1,  1, "UTF-8")) === true) {
    $iEnd = $iEnd - 1;
  }
  return mb_substr($sVal,  $iStart,  $iEnd - $iStart, "UTF-8");
};
$bIsIdentChar = function($sCh) {
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
$mReadWord = function($sCode, $iStart) use (&$bIsIdentChar) {
  $iLen = mb_strlen($sCode, "UTF-8");
    $i = $iStart;
    while ($i < $iLen && $bIsIdentChar(mb_substr($sCode,  $i,  1, "UTF-8")) === true) {
    $i = $i + 1;
  }
  return JSOL::dict("word",  mb_substr($sCode,  $iStart,  $i - $iStart, "UTF-8"),  "end",  $i);
};
$iSkipWhitespace = function($sCode, $iStart) {
  $iLen = mb_strlen($sCode, "UTF-8");
    $i = $iStart;
    while ($i < $iLen) {
    $sCh = mb_substr($sCode,  $i,  1, "UTF-8");
        if ($sCh === " " || $sCh === "\t" || $sCh === "\n" || $sCh === "\r") {
      $i = $i + 1;
    }
    else {
      return $i;
    }
  }
  return $i;
};
$mReadBalancedParens = function($sCode, $iOpenIndex) {
  $iLen = mb_strlen($sCode, "UTF-8");
    $iDepth = 0;
    $i = $iOpenIndex;
    $iInsideStart = -1;

    while ($i < $iLen) {
    $sCh = mb_substr($sCode,  $i,  1, "UTF-8");
        if ($sCh === "(") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($sCh === ")") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL::dict(
                    "inside",  mb_substr($sCode,  $iInsideStart,  $i - $iInsideStart, "UTF-8"), 
                    "end",  $i + 1
                );
      }
    }
    $i = $i + 1;
  }
  return JSOL::dict("inside",  "",  "end",  $iLen);
};
$sTranslateOperators = function($sExpr) use (&$bIsIdentChar, &$mReadWord) {
  $sResult = "";
    $i = 0;
    $iLen = mb_strlen($sExpr, "UTF-8");

    while ($i < $iLen) {
    $sCh = mb_substr($sExpr,  $i,  1, "UTF-8");
        $bAtBoundary = ($i === 0) || ($bIsIdentChar(mb_substr($sExpr,  $i - 1,  1, "UTF-8")) === false);

        if ($bAtBoundary === true && $bIsIdentChar($sCh) === true) {
      $mWord = $mReadWord($sExpr, $i);
            $sWord = $mWord["word"];

            if ($sWord === "true") {
        $sResult = $sResult . "" . "True";
                $i = $mWord["end"];
      }
      else if ($sWord === "false") {
        $sResult = $sResult . "" . "False";
                $i = $mWord["end"];
      }
      else if ($sWord === "null") {
        $sResult = $sResult . "" . "None";
                $i = $mWord["end"];
      }
      else {
        $sResult = $sResult . "" . $sWord;
                $i = $mWord["end"];
      }
    }
    else {
      $sTwo = mb_substr($sExpr,  $i,  2, "UTF-8");
            $sThree = mb_substr($sExpr,  $i,  3, "UTF-8");

            if ($sThree === "===") {
        $sResult = $sResult . "" . "==";
                $i = $i + 3;
      }
      else if ($sThree === "!==") {
        $sResult = $sResult . "" . "!=";
                $i = $i + 3;
      }
      else if ($sTwo === "&&") {
        $sResult = $sResult . "" . "and";
                $i = $i + 2;
      }
      else if ($sTwo === "||") {
        $sResult = $sResult . "" . "or";
                $i = $i + 2;
      }
      else if ($sTwo === "!=") {
        $sResult = $sResult . "" . "!=";
                $i = $i + 2;
      }
      else if (mb_substr($sExpr,  $i,  1, "UTF-8") === "!") {
        $sResult = $sResult . "" . "not ";
                $i = $i + 1;
      }
      else {
        $sResult = $sResult . "" . $sCh;
                $i = $i + 1;
      }
    }
  }
  return $sResult;
};
$mReadBalancedBraces = function($sCode, $iOpenIndex) {
  $iLen = mb_strlen($sCode, "UTF-8");
    $iDepth = 0;
    $i = $iOpenIndex;
    $iInsideStart = -1;
    while ($i < $iLen) {
    $sCh = mb_substr($sCode,  $i,  1, "UTF-8");
        if ($sCh === "{") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($sCh === "}") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL::dict("inside",  mb_substr($sCode,  $iInsideStart,  $i - $iInsideStart, "UTF-8"),  "end",  $i + 1);
      }
    }
    $i = $i + 1;
  }
  return JSOL::dict("inside",  "",  "end",  $iLen);
};
$sConvertControlFlowToPython = function($sMaskedCode) use (&$mReadWord, &$iSkipWhitespace, &$mReadBalancedParens, &$mReadBalancedBraces, &$sTranslateOperators, &$bIsIdentChar, &$sTrimWhitespace, &$sConvertControlFlowToPython) {
  $sResult = "";
    $i = 0;
    $iLen = mb_strlen($sMaskedCode, "UTF-8");

    while ($i < $iLen) {
    $sCh = mb_substr($sMaskedCode,  $i,  1, "UTF-8");
        $bAtBoundary = ($i === 0) || ($bIsIdentChar(mb_substr($sMaskedCode,  $i - 1,  1, "UTF-8")) === false);

        if ($bAtBoundary === true && $bIsIdentChar($sCh) === true) {
      $mWord = $mReadWord($sMaskedCode, $i);
            $sWord = $mWord["word"];

            if ($sWord === "null") {
        $sResult = $sResult . "" . "None";
                $i = $mWord["end"];
      }
      else if ($sWord === "true") {
        $sResult = $sResult . "" . "True";
                $i = $mWord["end"];
      }
      else if ($sWord === "false") {
        $sResult = $sResult . "" . "False";
                $i = $mWord["end"];
      }
      else if ($sWord === "if") {
        $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if (mb_substr($sMaskedCode,  $iAfter,  1, "UTF-8") === "(") {
          $mParens = $mReadBalancedParens($sMaskedCode, $iAfter);
                    $sResult = $sResult . "" . "if " . "" . $sTranslateOperators($mParens["inside"]) . "" . ":";
                    $i = $mParens["end"];
        }
        else {
          $sResult = $sResult . "" . $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "switch") {
        $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if (mb_substr($sMaskedCode,  $iAfter,  1, "UTF-8") === "(") {
          $mParens = $mReadBalancedParens($sMaskedCode, $iAfter);
                    $iAfterParens = $iSkipWhitespace($sMaskedCode, $mParens["end"]);
                    if (mb_substr($sMaskedCode,  $iAfterParens,  1, "UTF-8") === "{") {
            $mBraces = $mReadBalancedBraces($sMaskedCode, $iAfterParens);
                        $sBody = $sConvertControlFlowToPython($mBraces["inside"]);
                        $sResult = $sResult . "" . "_jsol_switch = " . "" . $sTranslateOperators($mParens["inside"]) . "" . "\n_jsol_done = False\nwhile not _jsol_done: {\n_jsol_done = True\nif False: pass" . "" . $sBody . "\n}";
                        $i = $mBraces["end"];
          }
          else {
            $sResult = $sResult . "" . "_jsol_switch = " . "" . $sTranslateOperators($mParens["inside"]) . "" . "\nif True:";
                        $i = $mParens["end"];
          }
        }
        else {
          $sResult = $sResult . "" . $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "case") {
        $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                $bFoundColon = false;
                $iColon = $iAfter;
                while ($iColon < $iLen) {
          $sChar = mb_substr($sMaskedCode,  $iColon,  1, "UTF-8");
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
          $sVal = mb_substr($sMaskedCode,  $iAfter,  $iColon - $iAfter, "UTF-8");
                    $sResult = $sResult . "" . "\nelif _jsol_switch == " . "" . $sTranslateOperators($sTrimWhitespace($sVal)) . "" . ":";
                    $i = $iColon + 1;
        }
        else {
          $sResult = $sResult . "" . $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "default") {
        $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if (mb_substr($sMaskedCode,  $iAfter,  1, "UTF-8") === ":") {
          $sResult = $sResult . "" . "\nelse:";
                    $i = $iAfter + 1;
        }
        else {
          $sResult = $sResult . "" . $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "else") {
        $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                $mMaybeIf = $mReadWord($sMaskedCode, $iAfter);
                if ($mMaybeIf["word"] === "if") {
          $iAfterIf = $iSkipWhitespace($sMaskedCode, $mMaybeIf["end"]);
                    if (mb_substr($sMaskedCode,  $iAfterIf,  1, "UTF-8") === "(") {
            $mParens = $mReadBalancedParens($sMaskedCode, $iAfterIf);
                        $sResult = $sResult . "" . "elif " . "" . $sTranslateOperators($mParens["inside"]) . "" . ":";
                        $i = $mParens["end"];
          }
          else {
            $sResult = $sResult . "" . "else";
                        $i = $mWord["end"];
          }
        }
        else if (mb_substr($sMaskedCode,  $iAfter,  1, "UTF-8") === "{") {
          $sResult = $sResult . "" . "else:";
                    $i = $mWord["end"];
        }
        else {
          $sResult = $sResult . "" . "else";
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "while") {
        $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if (mb_substr($sMaskedCode,  $iAfter,  1, "UTF-8") === "(") {
          $mParens = $mReadBalancedParens($sMaskedCode, $iAfter);
                    $sResult = $sResult . "" . "while " . "" . $sTranslateOperators($mParens["inside"]) . "" . ":";
                    $i = $mParens["end"];
        }
        else {
          $sResult = $sResult . "" . $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "for") {
        $iAfter = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                if (mb_substr($sMaskedCode,  $iAfter,  1, "UTF-8") === "(") {
          $mParens = $mReadBalancedParens($sMaskedCode, $iAfter);
                    $iAfterParens = $iSkipWhitespace($sMaskedCode, $mParens["end"]);
                    if (mb_substr($sMaskedCode,  $iAfterParens,  1, "UTF-8") === "{") {
            $mBraces = $mReadBalancedBraces($sMaskedCode, $iAfterParens);
                        
                        $sInsideParens = $mParens["inside"];
                        $iSemi1 = JSOL::strIndexOf($sInsideParens,  ";");
                        $sTail1 = mb_substr($sInsideParens,  $iSemi1 + 1,  mb_strlen($sInsideParens, "UTF-8") - ($iSemi1 + 1), "UTF-8");
                        $iSemi2 = JSOL::strIndexOf($sTail1,  ";");
                        $sTail2 = mb_substr($sTail1,  $iSemi2 + 1,  mb_strlen($sTail1, "UTF-8") - ($iSemi2 + 1), "UTF-8");
                        
                        $sInit = $sTrimWhitespace(mb_substr($sInsideParens,  0,  $iSemi1, "UTF-8"));
                        if (mb_substr($sInit,  0,  4, "UTF-8") === "let ") {
              $sInit = mb_substr($sInit,  4,  mb_strlen($sInit, "UTF-8") - 4, "UTF-8");
            }
            $sCond = $sTrimWhitespace(mb_substr($sTail1,  0,  $iSemi2, "UTF-8"));
                        $sStep = $sTrimWhitespace($sTail2);
                        
                        $sBody = $sConvertControlFlowToPython($mBraces["inside"]);
                        
                        $sResult = $sResult . "" . $sInit . ";\nwhile " . $sTranslateOperators($sCond) . ": {" . $sBody . "\n" . $sStep . ";\n}";
                        $i = $mBraces["end"];
          }
          else {
            $sResult = $sResult . "" . $sWord;
                        $i = $mWord["end"];
          }
        }
        else {
          $sResult = $sResult . "" . $sWord;
                    $i = $mWord["end"];
        }
      }
      else if ($sWord === "const" || $sWord === "let") {
        $iAfterKw = $iSkipWhitespace($sMaskedCode, $mWord["end"]);
                $mIdent = $mReadWord($sMaskedCode, $iAfterKw);
                $iAfterIdent = $iSkipWhitespace($sMaskedCode, $mIdent["end"]);

                if (mb_substr($sMaskedCode,  $iAfterIdent,  1, "UTF-8") === "=" && mb_substr($sMaskedCode,  $iAfterIdent,  2, "UTF-8") !== "==") {
          $iAfterEq = $iSkipWhitespace($sMaskedCode, $iAfterIdent + 1);
                    $mMaybeFunc = $mReadWord($sMaskedCode, $iAfterEq);

                    if ($mMaybeFunc["word"] === "function") {
            $iAfterFuncKw = $iSkipWhitespace($sMaskedCode, $mMaybeFunc["end"]);
                        if (mb_substr($sMaskedCode,  $iAfterFuncKw,  1, "UTF-8") === "(") {
              $mParams = $mReadBalancedParens($sMaskedCode, $iAfterFuncKw);
                            $sResult = $sResult . "" . "def " . "" . $mIdent["word"] . "" . "(" . "" . $mParams["inside"] . "" . "):";
                            $i = $mParams["end"];
            }
            else {
              $sResult = $sResult . "" . $mIdent["word"] . "" . " = ";
                            $i = $iAfterEq;
            }
          }
          else {
            $sResult = $sResult . "" . $mIdent["word"] . "" . " = ";
                        $i = $iAfterEq;
          }
        }
        else {
          $sResult = $sResult . "" . $mIdent["word"];
                    $i = $mIdent["end"];
        }
      }
      else {
        $sResult = $sResult . "" . $sWord;
                $i = $mWord["end"];
      }
    }
    else if ($sCh === "&" && mb_substr($sMaskedCode,  $i,  2, "UTF-8") === "&&") {
      $sResult = $sResult . "" . "and";
            $i = $i + 2;
    }
    else if ($sCh === "|" && mb_substr($sMaskedCode,  $i,  2, "UTF-8") === "||") {
      $sResult = $sResult . "" . "or";
            $i = $i + 2;
    }
    else if ($sCh === "=" && mb_substr($sMaskedCode,  $i,  3, "UTF-8") === "===") {
      $sResult = $sResult . "" . "==";
            $i = $i + 3;
    }
    else if ($sCh === "!" && mb_substr($sMaskedCode,  $i,  3, "UTF-8") === "!==") {
      $sResult = $sResult . "" . "!=";
            $i = $i + 3;
    }
    else if ($sCh === "!" && mb_substr($sMaskedCode,  $i,  2, "UTF-8") !== "!=") {
      $sResult = $sResult . "" . "not ";
            $i = $i + 1;
    }
    else {
      $sResult = $sResult . "" . $sCh;
            $i = $i + 1;
    }
  }
  return $sResult;
};
$sSanitizePythonIdentifiers = function($sMaskedCode) {
  $bIsIdentChar = function($sCh) {
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
    $aPyKeywords = [
        "False", "None", "True", "and", "as", "assert", "async", "await",
        "break", "class", "continue", "def", "del", "elif", "else", "except",
        "finally", "for", "from", "global", "if", "import", "in", "is",
        "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
        "try", "while", "with", "yield"
    ];

    // Builtins de uso frecuente que un nombre de variable de negocio puede
    // pisar una vez removido el prefijo tipado (ej. $str, $map, $type, $id).
    $aPyBuiltins = [
        "str", "int", "float", "bool", "list", "dict", "set", "tuple",
        "type", "id", "len", "map", "filter", "sum", "min", "max",
        "sorted", "input", "print", "format", "object", "super", "next",
        "iter", "hash", "range", "repr", "slice", "zip", "vars", "dir",
        "open", "eval", "exec", "abs", "all", "any", "bin", "chr", "ord",
        "hex", "oct", "pow", "round", "property", "staticmethod", "classmethod"
    ];

    $sResult = "";
    $iLen = mb_strlen($sMaskedCode, "UTF-8");
    $i = 0;
    while ($i < $iLen) {
    $sCh = mb_substr($sMaskedCode,  $i,  1, "UTF-8");
        if ($sCh === "$") {
      $iJ = $i + 1;
            while ($iJ < $iLen && $bIsIdentChar(mb_substr($sMaskedCode,  $iJ,  1, "UTF-8")) === true) {
        $iJ = $iJ + 1;
      }
      $sName = mb_substr($sMaskedCode,  $i + 1,  $iJ - $i - 1, "UTF-8");
            if (JSOL::arrIndexOf($aPyKeywords,  $sName) !== -1 || JSOL::arrIndexOf($aPyBuiltins,  $sName) !== -1) {
        $sName = $sName . "_";
      }
      // Estado original puro: NO SE AGREGA EL GUION BAJO
            $sResult = $sResult . "" . $sName;
            $i = $iJ;
    }
    else {
      $sResult = $sResult . "" . $sCh;
            $i = $i + 1;
    }
  }
  return $sResult;
};
