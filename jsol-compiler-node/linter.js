
// @JSOL v0.2.96 - Self-Hosted Compiler Linter Module (Dynamic SSOT Validation)
const $bIsLinterWordChar = function($sCh) {
  if ($sCh === "") {
    return false;
  }
  const $iCode = $sCh.charCodeAt( 0);
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
const $mAuditPragma = function($sSourceCode) {
  const $aErrors = [];
    let $bHasPragma = false;

    // Perfil-agnóstico: acepta @JSOL, JSOL, y sufijos de perfil como JSOL-X, JSOL-C, etc.
    // sin requerir cambios en el parser por cada perfil nuevo.
    if (Rgx.test("^\\s*//\\s*@?JSOL(-[A-Z]+)?\\b",  $sSourceCode,  "") === true) {
    $bHasPragma = true;
  }
  if ($bHasPragma === false) {
    $aErrors.push( "Fatal: Missing MANDATORY @JSOL pragma on Line 1.");
  }
  return JSOL.dict("valid",  $aErrors.length === 0,  "errors",  $aErrors);
};
const $mAuditForbiddenPatterns = function($sMaskedCode) {
  const $aErrors = [];
    const $aWarnings = [];

    const $aFunctionalMethods = [".map(", ".filter(", ".reduce(", ".forEach(", ".find("];
    let $bHasFunctionalMethods = false;
    const $iFmCount = $aFunctionalMethods.length;
    for (let $iFm = 0; $iFm < $iFmCount; $iFm = $iFm + 1) {
    if ($sMaskedCode.indexOf( $aFunctionalMethods[$iFm]) !== -1) {
      $bHasFunctionalMethods = true;
    }
  }
  if ($bHasFunctionalMethods === true) {
    $aErrors.push( "Linter Error: Functional array methods (.map, .filter, etc.) are FORBIDDEN. Use imperative for/while loops.");
  }
  let $bHasLengthProperty = false;
    const $iMLen = $sMaskedCode.length;
    for (let $iP = 0; $iP < $iMLen; $iP = $iP + 1) {
    if ($sMaskedCode.substring( $iP, ( $iP) + ( 7)) === ".length") {
      const $sNextChar = $sMaskedCode.substring( $iP + 7, ( $iP + 7) + ( 1));
            if ($bIsLinterWordChar($sNextChar) === false) {
        $bHasLengthProperty = true;
                break;
      }
    }
  }
  if ($bHasLengthProperty === true) {
    $aErrors.push( "Linter Error: Accessing .length is FORBIDDEN. Use Arr.count() for arrays or Str.len() for strings.");
  }
  if ($sMaskedCode.indexOf( "with (") !== -1 || $sMaskedCode.indexOf( "with(") !== -1) {
    $aErrors.push( "Linter Error: The 'with' statement is FORBIDDEN.");
  }
  if ($sMaskedCode.indexOf( "JSOL.use(") !== -1) {
    $aWarnings.push( "Linter Warning: JSOL.use() is DEPRECATED. Auto-use injection handles scope transparency now.");
  }
  if ($sMaskedCode.indexOf( "JSOL.JS") !== -1 || $sMaskedCode.indexOf( "JSOL.PHP") !== -1 || $sMaskedCode.indexOf( "JSOL.PY") !== -1) {
    $aWarnings.push( "Linter Warning: Asymmetric target blocks (JSOL.JS/PHP/PY) break isomorphic guarantees. Migrate to pure JSOL or native wrappers.");
  }
  return JSOL.dict("valid",  $aErrors.length === 0,  "errors",  $aErrors,  "warnings",  $aWarnings);
};
const $mAuditStrictTyping = function($sMaskedCode, $mSSOT) {
  const $aErrors = [];
    const $aWarnings = [];
    const $iLen = $sMaskedCode.length;
    
    let $iBraceDepth = 0;
    let $aActiveLoops = [];
    
    for (let $i = 0; $i < $iLen; $i = $i + 1) {
    const $sCh = $sMaskedCode.substring( $i, ( $i) + ( 1));
        
        if ($sCh === "{") {
      $iBraceDepth = $iBraceDepth + 1;
    }
    else if ($sCh === "}") {
      let $aNewLoops = [];
            const $iCount = $aActiveLoops.length;
            for (let $iK = 0; $iK < $iCount; $iK = $iK + 1) {
        if ($aActiveLoops[$iK]["depth"] < $iBraceDepth) {
          $aNewLoops.push( $aActiveLoops[$iK]);
        }
      }
      $aActiveLoops = $aNewLoops;
            $iBraceDepth = $iBraceDepth - 1;
    }
    else if ($sMaskedCode.substring( $i, ( $i) + ( 4)) === "for ") {
      let $iPeek = $i + 4;
            while ($iPeek < $iLen && ($sMaskedCode.substring( $iPeek, ( $iPeek) + ( 1)) === " " || $sMaskedCode.substring( $iPeek, ( $iPeek) + ( 1)) === "(")) {
        $iPeek = $iPeek + 1;
      }
      if ($sMaskedCode.substring( $iPeek, ( $iPeek) + ( 4)) === "let ") {
        $iPeek = $iPeek + 4;
                let $iV = $iPeek;
                while ($iV < $iLen && $bIsLinterWordChar($sMaskedCode.substring( $iV, ( $iV) + ( 1)))) {
          $iV = $iV + 1;
        }
        const $sVarName = $sMaskedCode.substring( $iPeek, ( $iPeek) + ( $iV - $iPeek));
                
                let $iOf = $iV;
                while ($iOf < $iLen && $sMaskedCode.substring( $iOf, ( $iOf) + ( 1)) === " ") {
          $iOf = $iOf + 1;
        }
        if ($sMaskedCode.substring( $iOf, ( $iOf) + ( 2)) === "of") {
          let $iR = $iOf + 2;
                    while ($iR < $iLen && $sMaskedCode.substring( $iR, ( $iR) + ( 1)) === " ") {
            $iR = $iR + 1;
          }
          if ($sMaskedCode.substring( $iR, ( $iR) + ( 11)) === "JSOL.range(") {
            let $bShadow = false;
                        for (let $iK = 0; $iK < $aActiveLoops.length; $iK = $iK + 1) {
              if ($aActiveLoops[$iK]["var"] === $sVarName) {
                $bShadow = true; break;
              }
            }
            if ($bShadow === true) {
              $aErrors.push( "Linter Fatal Error: Shadowing of loop variable '" + $sVarName + "' is forbidden.");
            }
            $aActiveLoops.push( JSOL.dict("var",  $sVarName,  "depth",  $iBraceDepth + 1));

                        let $iParenDepth = 0;
                        let $iArgsEnd = -1;
                        for (let $iK = $iR + 10; $iK < $iLen; $iK = $iK + 1) {
              if ($sMaskedCode.substring( $iK, ( $iK) + ( 1)) === "(") {
                $iParenDepth = $iParenDepth + 1;
              }
              else if ($sMaskedCode.substring( $iK, ( $iK) + ( 1)) === ")") {
                $iParenDepth = $iParenDepth - 1;
                                if ($iParenDepth === 0) {
                  $iArgsEnd = $iK; break;
                }
              }
            }
            if ($iArgsEnd !== -1) {
              const $sArgs = $sMaskedCode.substring( $iR + 11, ( $iR + 11) + ( $iArgsEnd - $iR - 11));
                            let $iCommas = 0;
                            let $iADepth = 0;
                            let $bInStr = false;
                            for (let $iK = 0; $iK < $sArgs.length; $iK = $iK + 1) {
                const $sC = $sArgs.substring( $iK, ( $iK) + ( 1));
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
                $aWarnings.push( "Linter Warning: JSOL.range lacks $qMaxTimes argument (4th arg). Recommended for JSOL-X profile.");
              }
            }
          }
        }
      }
    }
    else if ($sMaskedCode.substring( $i, ( $i) + ( 8)) === ["$",  "JSOL_i_"].join("")) {
      let $iV = $i + 8;
            while ($iV < $iLen && $bIsLinterWordChar($sMaskedCode.substring( $iV, ( $iV) + ( 1)))) {
        $iV = $iV + 1;
      }
      const $sBaseVar = ["$",  $sMaskedCode.substring( $i + 8, ( $i + 8) + ( $iV - $i - 8))].join("");
            let $bFound = false;
            for (let $iK = 0; $iK < $aActiveLoops.length; $iK = $iK + 1) {
        if ($aActiveLoops[$iK]["var"] === $sBaseVar) {
          $bFound = true; break;
        }
      }
      if ($bFound === false) {
        $aErrors.push( ["Linter Fatal Error: Invalid reference to '$",  "JSOL_i_",  $sMaskedCode.substring( $i + 8, ( $i + 8) + ( $iV - $i - 8)),  "'. Loop variable '",  $sBaseVar,  "' is not active in this scope."].join(""));
      }
    }
    if ($sCh === "$") {
      let $iJ = $i + 1;
            while ($iJ < $iLen && $bIsLinterWordChar($sMaskedCode.substring( $iJ, ( $iJ) + ( 1)))) {
        $iJ = $iJ + 1;
      }
      const $sVarName = $sMaskedCode.substring( $i, ( $i) + ( $iJ - $i));
            
            if ($sVarName.indexOf( ["$",  "_"].join("")) === 0 || $sVarName.indexOf( ["$",  "JSOL_"].join("")) === 0) {
        let $iBack = $i - 1;
                while ($iBack >= 0 && ($sMaskedCode.substring( $iBack, ( $iBack) + ( 1)) === " " || $sMaskedCode.substring( $iBack, ( $iBack) + ( 1)) === "\t" || $sMaskedCode.substring( $iBack, ( $iBack) + ( 1)) === "\n" || $sMaskedCode.substring( $iBack, ( $iBack) + ( 1)) === "(")) {
          $iBack = $iBack - 1;
        }
        if ($iBack >= 2 && $sMaskedCode.substring( $iBack - 2, ( $iBack - 2) + ( 3)) === "let") {
          $aErrors.push( ["Linter Error: Variable '",  $sVarName,  "' uses reserved internal prefix in declaration."].join(""));
        }
        else if ($iBack >= 4 && $sMaskedCode.substring( $iBack - 4, ( $iBack - 4) + ( 5)) === "const") {
          $aErrors.push( ["Linter Error: Variable '",  $sVarName,  "' uses reserved internal prefix in declaration."].join(""));
        }
        $i = $iJ - 1;
                continue;
      }
      let $sPrefix = "";
            let $iK = 1;
            const $iVarLen = $sVarName.length;
            while ($iK < $iVarLen) {
        const $iCode = $sVarName.charCodeAt( $iK);
                if ($iCode >= 97 && $iCode <= 122) {
          $sPrefix = $sPrefix + "" + String.fromCharCode($iCode);
                    $iK = $iK + 1;
        }
        else {
          break;
        }
      }
      if ($sPrefix.length === 0) {
        if ($sVarName.length > 1) {
          $aErrors.push( "Linter Error: Variable '" + $sVarName + "' lacks a valid lowercase type prefix.");
        }
      }
      else {
        let $bValid = false;
                const $aTypes = Object.keys($mSSOT["types"]["core"]);
                const $iTCount = $aTypes.length;
                
                for (let $iT = 0; $iT < $iTCount; $iT = $iT + 1) {
          const $aAliases = $mSSOT["types"]["core"][$aTypes[$iT]];
                    if ($aAliases.indexOf( $sPrefix) !== -1) {
            $bValid = true;
                        break;
          }
        }
        if ($bValid === false) {
          const $aReserved = $mSSOT["types"]["reserved"];
                    if ($aReserved.indexOf( $sPrefix) !== -1) {
            $aErrors.push( "Linter Error: Type prefix '" + $sPrefix + "' in variable '" + $sVarName + "' is RESERVED and not implemented.");
                        $bValid = true;
          }
        }
        if ($bValid === false && Object.prototype.hasOwnProperty.call($mSSOT["types"],  "custom") === true) {
          const $aCustom = $mSSOT["types"]["custom"];
                    if ($aCustom.indexOf( $sPrefix) !== -1) {
            if ($sPrefix.length >= 3) {
              $bValid = true;
            }
            else {
              $aErrors.push( "Linter Error: Custom type prefix '" + $sPrefix + "' in variable '" + $sVarName + "' must be 3 or more characters.");
                            $bValid = true;
            }
          }
        }
        if ($bValid === false) {
          $aErrors.push( "Linter Error: Unknown or unregistered type prefix '" + $sPrefix + "' in variable '" + $sVarName + "'. No truncation fallback allowed.");
        }
      }
      $i = $iJ - 1;
    }
  }
  return JSOL.dict("valid",  $aErrors.length === 0,  "errors",  $aErrors,  "warnings",  $aWarnings);
};
