<?php

// @JSOL v0.2.96 - Self-Hosted Compiler Linter Module (Dynamic SSOT Validation)
$bIsLinterWordChar = function($sCh) {
  if ($sCh === "") {
    return false;
  }
  $iCode = mb_ord(mb_substr($sCh,  0, 1, "UTF-8"));
    if ($iCode >= 48 && $iCode <= 57) {
    return true;
  }
  if ($iCode >= 65 && $iCode <= 90) {
    return true;
  }
  if ($iCode >= 97 && $iCode <= 122) {
    return true;
  }
  if ($iCode === 95) {
    return true;
  }
  return false;
};
$mAuditPragma = function($sSourceCode) {
  $aErrors = [];
    $bHasPragma = false;

    // Perfil-agnóstico: acepta @JSOL, JSOL, y sufijos de perfil como JSOL-X, JSOL-C, etc.
    // sin requerir cambios en el parser por cada perfil nuevo.
    if (Rgx::test("^\\s*//\\s*@?JSOL(-[A-Z]+)?\\b",  $sSourceCode,  "") === true) {
    $bHasPragma = true;
  }
  if ($bHasPragma === false) {
    $aErrors[] =  "Fatal: Missing MANDATORY @JSOL pragma on Line 1.";
  }
  return JSOL::dict("valid",  count($aErrors) === 0,  "errors",  $aErrors);
};
$mAuditForbiddenPatterns = function($sMaskedCode) use (&$bIsLinterWordChar) {
  $aErrors = [];
    $aWarnings = [];

    $aFunctionalMethods = [".map(", ".filter(", ".reduce(", ".forEach(", ".find("];
    $bHasFunctionalMethods = false;
    $iFmCount = count($aFunctionalMethods);
    for ($iFm = 0; $iFm < $iFmCount; $iFm = $iFm + 1) {
    if (JSOL::strIndexOf($sMaskedCode,  $aFunctionalMethods[$iFm]) !== -1) {
      $bHasFunctionalMethods = true;
    }
  }
  if ($bHasFunctionalMethods === true) {
    $aErrors[] =  "Linter Error: Functional array methods (.map, .filter, etc.) are FORBIDDEN. Use imperative for/while loops.";
  }
  $bHasLengthProperty = false;
    $iMLen = mb_strlen($sMaskedCode, "UTF-8");
    for ($iP = 0; $iP < $iMLen; $iP = $iP + 1) {
    if (mb_substr($sMaskedCode,  $iP,  7, "UTF-8") === ".length") {
      $sNextChar = mb_substr($sMaskedCode,  $iP + 7,  1, "UTF-8");
            if ($bIsLinterWordChar($sNextChar) === false) {
        $bHasLengthProperty = true;
                break;
      }
    }
  }
  if ($bHasLengthProperty === true) {
    $aErrors[] =  "Linter Error: Accessing .length is FORBIDDEN. Use Arr.count() for arrays or Str.len() for strings.";
  }
  if (JSOL::strIndexOf($sMaskedCode,  "with (") !== -1 || JSOL::strIndexOf($sMaskedCode,  "with(") !== -1) {
    $aErrors[] =  "Linter Error: The 'with' statement is FORBIDDEN.";
  }
  if (JSOL::strIndexOf($sMaskedCode,  "JSOL.use(") !== -1) {
    $aWarnings[] =  "Linter Warning: JSOL.use() is DEPRECATED. Auto-use injection handles scope transparency now.";
  }
  if (JSOL::strIndexOf($sMaskedCode,  "JSOL.JS") !== -1 || JSOL::strIndexOf($sMaskedCode,  "JSOL.PHP") !== -1 || JSOL::strIndexOf($sMaskedCode,  "JSOL.PY") !== -1) {
    $aWarnings[] =  "Linter Warning: Asymmetric target blocks (JSOL.JS/PHP/PY) break isomorphic guarantees. Migrate to pure JSOL or native wrappers.";
  }
  return JSOL::dict("valid",  count($aErrors) === 0,  "errors",  $aErrors,  "warnings",  $aWarnings);
};
$mAuditStrictTyping = function($sMaskedCode, $mSSOT) use (&$bIsLinterWordChar) {
  $aErrors = [];
    $aWarnings = [];
    $iLen = mb_strlen($sMaskedCode, "UTF-8");
    
    $iBraceDepth = 0;
    $aActiveLoops = [];
    
    for ($i = 0; $i < $iLen; $i = $i + 1) {
    $sCh = mb_substr($sMaskedCode,  $i,  1, "UTF-8");
        
        if ($sCh === "{") {
      $iBraceDepth = $iBraceDepth + 1;
    }
    else if ($sCh === "}") {
      $aNewLoops = [];
            $iCount = count($aActiveLoops);
            for ($iK = 0; $iK < $iCount; $iK = $iK + 1) {
        if ($aActiveLoops[$iK]["depth"] < $iBraceDepth) {
          $aNewLoops[] =  $aActiveLoops[$iK];
        }
      }
      $aActiveLoops = $aNewLoops;
            $iBraceDepth = $iBraceDepth - 1;
    }
    else if (mb_substr($sMaskedCode,  $i,  4, "UTF-8") === "for ") {
      $iPeek = $i + 4;
            while ($iPeek < $iLen && (mb_substr($sMaskedCode,  $iPeek,  1, "UTF-8") === " " || mb_substr($sMaskedCode,  $iPeek,  1, "UTF-8") === "(")) {
        $iPeek = $iPeek + 1;
      }
      if (mb_substr($sMaskedCode,  $iPeek,  4, "UTF-8") === "let ") {
        $iPeek = $iPeek + 4;
                $iV = $iPeek;
                while ($iV < $iLen && $bIsLinterWordChar(mb_substr($sMaskedCode,  $iV,  1, "UTF-8"))) {
          $iV = $iV + 1;
        }
        $sVarName = mb_substr($sMaskedCode,  $iPeek,  $iV - $iPeek, "UTF-8");
                
                $iOf = $iV;
                while ($iOf < $iLen && mb_substr($sMaskedCode,  $iOf,  1, "UTF-8") === " ") {
          $iOf = $iOf + 1;
        }
        if (mb_substr($sMaskedCode,  $iOf,  2, "UTF-8") === "of") {
          $iR = $iOf + 2;
                    while ($iR < $iLen && mb_substr($sMaskedCode,  $iR,  1, "UTF-8") === " ") {
            $iR = $iR + 1;
          }
          if (mb_substr($sMaskedCode,  $iR,  11, "UTF-8") === "JSOL.range(") {
            $bShadow = false;
                        for ($iK = 0; $iK < count($aActiveLoops); $iK = $iK + 1) {
              if ($aActiveLoops[$iK]["var"] === $sVarName) {
                $bShadow = true; break;
              }
            }
            if ($bShadow === true) {
              $aErrors[] =  "Linter Fatal Error: Shadowing of loop variable '" . $sVarName . "' is forbidden.";
            }
            $aActiveLoops[] =  JSOL::dict("var",  $sVarName,  "depth",  $iBraceDepth + 1);

                        $iParenDepth = 0;
                        $iArgsEnd = -1;
                        for ($iK = $iR + 10; $iK < $iLen; $iK = $iK + 1) {
              if (mb_substr($sMaskedCode,  $iK,  1, "UTF-8") === "(") {
                $iParenDepth = $iParenDepth + 1;
              }
              else if (mb_substr($sMaskedCode,  $iK,  1, "UTF-8") === ")") {
                $iParenDepth = $iParenDepth - 1;
                                if ($iParenDepth === 0) {
                  $iArgsEnd = $iK; break;
                }
              }
            }
            if ($iArgsEnd !== -1) {
              $sArgs = mb_substr($sMaskedCode,  $iR + 11,  $iArgsEnd - $iR - 11, "UTF-8");
                            $iCommas = 0;
                            $iADepth = 0;
                            $bInStr = false;
                            for ($iK = 0; $iK < mb_strlen($sArgs, "UTF-8"); $iK = $iK + 1) {
                $sC = mb_substr($sArgs,  $iK,  1, "UTF-8");
                                if ($sC === '"') {
                  $bInStr = !$bInStr;
                }
                if ($bInStr === false) {
                  if ($sC === "(" || $sC === "[" || $sC === "{") {
                    $iADepth = $iADepth + 1;
                  }
                  if ($sC === ")" || $sC === "]" || $sC === "}") {
                    $iADepth = $iADepth - 1;
                  }
                  if ($sC === "," && $iADepth === 0) {
                    $iCommas = $iCommas + 1;
                  }
                }
              }
              if ($iCommas < 3) {
                $aWarnings[] =  "Linter Warning: JSOL.range lacks $qMaxTimes argument (4th arg). Recommended for JSOL-X profile.";
              }
            }
          }
        }
      }
    }
    else if (mb_substr($sMaskedCode,  $i,  8, "UTF-8") === implode("", ["$",  "JSOL_i_"])) {
      $iV = $i + 8;
            while ($iV < $iLen && $bIsLinterWordChar(mb_substr($sMaskedCode,  $iV,  1, "UTF-8"))) {
        $iV = $iV + 1;
      }
      $sBaseVar = implode("", ["$",  mb_substr($sMaskedCode,  $i + 8,  $iV - $i - 8, "UTF-8")]);
            $bFound = false;
            for ($iK = 0; $iK < count($aActiveLoops); $iK = $iK + 1) {
        if ($aActiveLoops[$iK]["var"] === $sBaseVar) {
          $bFound = true; break;
        }
      }
      if ($bFound === false) {
        $aErrors[] =  implode("", ["Linter Fatal Error: Invalid reference to '$",  "JSOL_i_",  mb_substr($sMaskedCode,  $i + 8,  $iV - $i - 8, "UTF-8"),  "'. Loop variable '",  $sBaseVar,  "' is not active in this scope."]);
      }
    }
    if ($sCh === "$") {
      $iJ = $i + 1;
            while ($iJ < $iLen && $bIsLinterWordChar(mb_substr($sMaskedCode,  $iJ,  1, "UTF-8"))) {
        $iJ = $iJ + 1;
      }
      $sVarName = mb_substr($sMaskedCode,  $i,  $iJ - $i, "UTF-8");
            
            if (JSOL::strIndexOf($sVarName,  implode("", ["$",  "_"])) === 0 || JSOL::strIndexOf($sVarName,  implode("", ["$",  "JSOL_"])) === 0) {
        $iBack = $i - 1;
                while ($iBack >= 0 && (mb_substr($sMaskedCode,  $iBack,  1, "UTF-8") === " " || mb_substr($sMaskedCode,  $iBack,  1, "UTF-8") === "\t" || mb_substr($sMaskedCode,  $iBack,  1, "UTF-8") === "\n" || mb_substr($sMaskedCode,  $iBack,  1, "UTF-8") === "(")) {
          $iBack = $iBack - 1;
        }
        if ($iBack >= 2 && mb_substr($sMaskedCode,  $iBack - 2,  3, "UTF-8") === "let") {
          $aErrors[] =  implode("", ["Linter Error: Variable '",  $sVarName,  "' uses reserved internal prefix in declaration."]);
        }
        else if ($iBack >= 4 && mb_substr($sMaskedCode,  $iBack - 4,  5, "UTF-8") === "const") {
          $aErrors[] =  implode("", ["Linter Error: Variable '",  $sVarName,  "' uses reserved internal prefix in declaration."]);
        }
        $i = $iJ - 1;
                continue;
      }
      $sPrefix = "";
            $iK = 1;
            $iVarLen = mb_strlen($sVarName, "UTF-8");
            while ($iK < $iVarLen) {
        $iCode = mb_ord(mb_substr($sVarName,  $iK, 1, "UTF-8"));
                if ($iCode >= 97 && $iCode <= 122) {
          $sPrefix = $sPrefix . "" . mb_chr($iCode, "UTF-8");
                    $iK = $iK + 1;
        }
        else {
          break;
        }
      }
      if (mb_strlen($sPrefix, "UTF-8") === 0) {
        if (mb_strlen($sVarName, "UTF-8") > 1) {
          $aErrors[] =  "Linter Error: Variable '" . $sVarName . "' lacks a valid lowercase type prefix.";
        }
      }
      else {
        $bValid = false;
                $aTypes = array_keys($mSSOT["types"]["core"]);
                $iTCount = count($aTypes);
                
                for ($iT = 0; $iT < $iTCount; $iT = $iT + 1) {
          $aAliases = $mSSOT["types"]["core"][$aTypes[$iT]];
                    if (JSOL::arrIndexOf($aAliases,  $sPrefix) !== -1) {
            $bValid = true;
                        break;
          }
        }
        if ($bValid === false) {
          $aReserved = $mSSOT["types"]["reserved"];
                    if (JSOL::arrIndexOf($aReserved,  $sPrefix) !== -1) {
            $aErrors[] =  "Linter Error: Type prefix '" . $sPrefix . "' in variable '" . $sVarName . "' is RESERVED and not implemented.";
                        $bValid = true;
          }
        }
        if ($bValid === false && isset($mSSOT["types"][ "custom"]) === true) {
          $aCustom = $mSSOT["types"]["custom"];
                    if (JSOL::arrIndexOf($aCustom,  $sPrefix) !== -1) {
            if (mb_strlen($sPrefix, "UTF-8") >= 3) {
              $bValid = true;
            }
            else {
              $aErrors[] =  "Linter Error: Custom type prefix '" . $sPrefix . "' in variable '" . $sVarName . "' must be 3 or more characters.";
                            $bValid = true;
            }
          }
        }
        if ($bValid === false) {
          $aErrors[] =  "Linter Error: Unknown or unregistered type prefix '" . $sPrefix . "' in variable '" . $sVarName . "'. No truncation fallback allowed.";
        }
      }
      $i = $iJ - 1;
    }
  }
  return JSOL::dict("valid",  count($aErrors) === 0,  "errors",  $aErrors,  "warnings",  $aWarnings);
};
