// @JSOL v0.2.97 - Self-Hosted Compiler Linter Module (Dynamic SSOT Validation)
const $bIsLinterWordChar = function($saCh) {
  if ($saCh === "") {
    return false;
  }
  const $iCode = Str["char"]($saCh,  0);
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
const $mAuditPragma = function($saSourceCode) {
  const $aErrors = [];
    if (Rgx.test("^\\s*//\\s*@?JSOL(-[A-Z]+)?\\b",  $saSourceCode,  "") === false) {
    $aErrors.push( "Fatal: Missing MANDATORY @JSOL pragma on Line 1.");
  }
  return JSOL.dict("valid",  $aErrors.length === 0,  "errors",  $aErrors);
};
const $mAuditForbiddenPatterns = function($saMaskedCode) {
  const $aErrors = [];
    const $aWarnings = [];

    const $aFunctionalMethods = [".map(", ".filter(", ".reduce(", ".forEach(", ".find("];
    for (let $iFm = 0; $iFm < $aFunctionalMethods.length; $iFm = $iFm + 1) {
    if (Str["indexOf"]($saMaskedCode,  $aFunctionalMethods[$iFm]) !== -1) {
      $aErrors.push( "Linter Error: Native functional array methods (.map, .filter, etc.) are FORBIDDEN. Use Arr.map / Arr.filter or imperative loops.");
            break;
    }
  }
  const $iMLen = Str["len"]($saMaskedCode);
    for (let $iP = 0; $iP < $iMLen; $iP = $iP + 1) {
    if (Str["sub"]($saMaskedCode,  $iP,  7) === ".length") {
      const $saNextChar = Str["sub"]($saMaskedCode,  $iP + 7,  1);
            if ($bIsLinterWordChar($saNextChar) === false) {
        $aErrors.push( "Linter Error: Accessing .length is FORBIDDEN. Use Arr.len() for arrays or Str.len() for strings.");
                break;
      }
    }
  }
  if (Str["indexOf"]($saMaskedCode,  "with (") !== -1 || Str["indexOf"]($saMaskedCode,  "with(") !== -1) {
    $aErrors.push( "Linter Error: The 'with' statement is FORBIDDEN.");
  }
  if (Str["indexOf"]($saMaskedCode,  "JSOL.use(") !== -1) {
    $aWarnings.push( "Linter Warning: JSOL.use() is DEPRECATED. Auto-use injection handles scope transparency now.");
  }
  if (Rgx.test("Arr\\.sort\\s*\\(\\s*[^,)]+\\s*\\)",  $saMaskedCode,  "")) {
    $aErrors.push( "Linter Error: Arr.sort requires an explicit comparator function as the second argument.");
  }
  if (Rgx.test("Arr\\.(map|filter|reduce)\\s*\\(.*=>\\s*\\{",  $saMaskedCode,  "")) {
    $aErrors.push( "Linter Error: Arr.map/filter/reduce lambdas cannot use multi-line blocks { ... }. Use single-expression lambdas or named functions.");
  }
  if (Str["indexOf"]($saMaskedCode,  "%") !== -1) {
    $aErrors.push( 'Linter Error: The modulo operator \'%\' is FORBIDDEN. Use Math.modX($a, $b).');
  }
  return JSOL.dict("valid",  $aErrors.length === 0,  "errors",  $aErrors,  "warnings",  $aWarnings);
};
const $mAuditStrictTyping = function($saMaskedCode, $mSSOT) {
  const $aErrors = [];
    const $aWarnings = [];
    const $iLen = Str["len"]($saMaskedCode);
    let $iBraceDepth = 0;
    let $mDeclaredRootsByDepth = JSOL.dict();

    for (let $i = 0; $i < $iLen; $i = $i + 1) {
    const $saCh = Str["sub"]($saMaskedCode,  $i,  1);

        if ($saCh === "{") {
      $iBraceDepth = $iBraceDepth + 1;
    }
    else if ($saCh === "}") {
      $mDeclaredRootsByDepth[Cast["toStr"]($iBraceDepth)] = null;
            $iBraceDepth = $iBraceDepth - 1;
    }
    else if ($saCh === "$") {
      let $iJ = $i + 1;
            while ($iJ < $iLen && $bIsLinterWordChar(Str["sub"]($saMaskedCode,  $iJ,  1))) {
        $iJ = $iJ + 1;
      }
      const $saVarName = Str["sub"]($saMaskedCode,  $i,  $iJ - $i);

            if (Str["indexOf"]($saVarName,  '$_') === 0 || Str["indexOf"]($saVarName,  '$JSOL_') === 0) {
        $i = $iJ - 1;
                continue;
      }
      let $saPrefix = "";
            let $iK = 1;
            const $iVarLen = Str["len"]($saVarName);
            while ($iK < $iVarLen) {
        const $iCode = Str["char"]($saVarName,  $iK);
                if ($iCode >= 97 && $iCode <= 122) {
          $saPrefix = Str["concat"]($saPrefix,  Str["fromChar"]($iCode));
                    $iK = $iK + 1;
        }
        else {
          break;
        }
      }
      if (Str["len"]($saPrefix) > 0) {
        if ($iVarLen === Str["len"]($saPrefix) + 1) {
          $i = $iJ - 1;
                    continue;
        }
        const $saDelim = Str["sub"]($saVarName,  Str["len"]($saPrefix) + 1,  1);
                const $iNextCode = Str["char"]($saVarName,  Str["len"]($saPrefix) + 1);
                const $bIsUpper = ($iNextCode >= 65 && $iNextCode <= 90);

                if ($saDelim !== "_" && $bIsUpper === false) {
          $aErrors.push( Str["concat"]("LINTER_PREFIX_DELIMITER_REQUIRED: Variable '",  $saVarName,  "' lacks '_' or CamelCase delimiter after prefix '",  $saPrefix,  "'."));
        }
        let $iOffset = 0;
                if ($saDelim === "_") {
          $iOffset = 1;
        }
        const $saRoot = Str["sub"]($saVarName,  $iK + $iOffset,  $iVarLen).toLowerCase();

                if (Str["len"]($saRoot) > 0) {
          const $saDepthKey = Cast["toStr"]($iBraceDepth);
                    if (Object.prototype.hasOwnProperty.call($mDeclaredRootsByDepth,  $saDepthKey) === false || $mDeclaredRootsByDepth[$saDepthKey] === null) {
            $mDeclaredRootsByDepth[$saDepthKey] = JSOL.dict();
          }
          if (Object.prototype.hasOwnProperty.call($mDeclaredRootsByDepth[$saDepthKey],  $saRoot) === true) {
            const $saExistingType = $mDeclaredRootsByDepth[$saDepthKey][$saRoot];
                        if ($saExistingType !== $saPrefix) {
              $aErrors.push( Str["concat"]("Linter Error: Root name collision for '",  $saRoot,  "' with different types ('",  $saExistingType,  "' vs '",  $saPrefix,  "') at scope depth ",  $saDepthKey,  "."));
            }
          }
          else {
            $mDeclaredRootsByDepth[$saDepthKey][$saRoot] = $saPrefix;
          }
        }
      }
      $i = $iJ - 1;
    }
  }
  return JSOL.dict("valid",  $aErrors.length === 0,  "errors",  $aErrors,  "warnings",  $aWarnings);
};
