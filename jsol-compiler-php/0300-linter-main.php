<?php
// @JSOL v0.2.97 - Self-Hosted Compiler Linter Module (Dynamic SSOT Validation)
$bIsLinterWordChar = function($saCh) {
  if ($saCh === "") {
    return false;
  }
  $iCode = mb_ord(mb_substr($saCh,  0, 1, "UTF-8"), "UTF-8");
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
$mAuditPragma = function($saSourceCode) {
  $aErrors = [];
    if (Rgx::test("^\\s*//\\s*@?JSOL(-[A-Z]+)?\\b",  $saSourceCode,  "") === false) {
    $aErrors[] =  "Fatal: Missing MANDATORY @JSOL pragma on Line 1.";
  }
  return JSOL::dict("valid",  count($aErrors) === 0,  "errors",  $aErrors);
};
$mAuditForbiddenPatterns = function($saMaskedCode) use (&$bIsLinterWordChar) {
  $aErrors = [];
    $aWarnings = [];

    $aFunctionalMethods = [".map(", ".filter(", ".reduce(", ".forEach(", ".find("];
    for ($iFm = 0; $iFm < count($aFunctionalMethods); $iFm = $iFm + 1) {
    if (Str::indexOf($saMaskedCode,  $aFunctionalMethods[$iFm]) !== -1) {
      $aErrors[] =  "Linter Error: Native functional array methods (.map, .filter, etc.) are FORBIDDEN. Use Arr.map / Arr.filter or imperative loops.";
            break;
    }
  }
  $iMLen = mb_strlen($saMaskedCode, "UTF-8");
    for ($iP = 0; $iP < $iMLen; $iP = $iP + 1) {
    if (mb_substr($saMaskedCode,  $iP,  7, "UTF-8") === ".length") {
      $saNextChar = mb_substr($saMaskedCode,  $iP + 7,  1, "UTF-8");
            if ($bIsLinterWordChar($saNextChar) === false) {
        $aErrors[] =  "Linter Error: Accessing .length is FORBIDDEN. Use Arr.len() for arrays or Str.len() for strings.";
                break;
      }
    }
  }
  if (Str::indexOf($saMaskedCode,  "with (") !== -1 || Str::indexOf($saMaskedCode,  "with(") !== -1) {
    $aErrors[] =  "Linter Error: The 'with' statement is FORBIDDEN.";
  }
  if (Str::indexOf($saMaskedCode,  "JSOL.use(") !== -1) {
    $aWarnings[] =  "Linter Warning: JSOL.use() is DEPRECATED. Auto-use injection handles scope transparency now.";
  }
  if (Rgx::test("Arr\\.sort\\s*\\(\\s*[^,)]+\\s*\\)",  $saMaskedCode,  "")) {
    $aErrors[] =  "Linter Error: Arr.sort requires an explicit comparator function as the second argument.";
  }
  if (Rgx::test("Arr\\.(map|filter|reduce)\\s*\\(.*=>\\s*\\{",  $saMaskedCode,  "")) {
    $aErrors[] =  "Linter Error: Arr.map/filter/reduce lambdas cannot use multi-line blocks { ... }. Use single-expression lambdas or named functions.";
  }
  if (Str::indexOf($saMaskedCode,  "%") !== -1) {
    $aErrors[] =  "Linter Error: The modulo operator '%' is FORBIDDEN. Use Math.modX($a, $b).";
  }
  return JSOL::dict("valid",  count($aErrors) === 0,  "errors",  $aErrors,  "warnings",  $aWarnings);
};
$mAuditStrictTyping = function($saMaskedCode, $mSSOT) use (&$bIsLinterWordChar) {
  $aErrors = [];
    $aWarnings = [];
    $iLen = mb_strlen($saMaskedCode, "UTF-8");
    $iBraceDepth = 0;
    $mDeclaredRootsByDepth = JSOL::dict();

    for ($i = 0; $i < $iLen; $i = $i + 1) {
    $saCh = mb_substr($saMaskedCode,  $i,  1, "UTF-8");

        if ($saCh === "{") {
      $iBraceDepth = $iBraceDepth + 1;
    }
    else if ($saCh === "}") {
      $mDeclaredRootsByDepth[Cast::toStr($iBraceDepth)] = null;
            $iBraceDepth = $iBraceDepth - 1;
    }
    else if ($saCh === "$") {
      $iJ = $i + 1;
            while ($iJ < $iLen && $bIsLinterWordChar(mb_substr($saMaskedCode,  $iJ,  1, "UTF-8"))) {
        $iJ = $iJ + 1;
      }
      $saVarName = mb_substr($saMaskedCode,  $i,  $iJ - $i, "UTF-8");

            if (Str::indexOf($saVarName,  '$_') === 0 || Str::indexOf($saVarName,  '$JSOL_') === 0) {
        $i = $iJ - 1;
                continue;
      }
      $saPrefix = "";
            $iK = 1;
            $iVarLen = mb_strlen($saVarName, "UTF-8");
            while ($iK < $iVarLen) {
        $iCode = mb_ord(mb_substr($saVarName,  $iK, 1, "UTF-8"), "UTF-8");
                if ($iCode >= 97 && $iCode <= 122) {
          $saPrefix = Str::concat($saPrefix,  mb_chr($iCode, "UTF-8"));
                    $iK = $iK + 1;
        }
        else {
          break;
        }
      }
      if (mb_strlen($saPrefix, "UTF-8") > 0) {
        if ($iVarLen === mb_strlen($saPrefix, "UTF-8") + 1) {
          $i = $iJ - 1;
                    continue;
        }
        $saDelim = mb_substr($saVarName,  mb_strlen($saPrefix, "UTF-8") + 1,  1, "UTF-8");
                $iNextCode = mb_ord(mb_substr($saVarName,  mb_strlen($saPrefix, "UTF-8") + 1, 1, "UTF-8"), "UTF-8");
                $bIsUpper = ($iNextCode >= 65 && $iNextCode <= 90);

                if ($saDelim !== "_" && $bIsUpper === false) {
          $aErrors[] =  Str::concat("LINTER_PREFIX_DELIMITER_REQUIRED: Variable '",  $saVarName,  "' lacks '_' or CamelCase delimiter after prefix '",  $saPrefix,  "'.");
        }
        $iOffset = 0;
                if ($saDelim === "_") {
          $iOffset = 1;
        }
        $saRoot = mb_strtolower(mb_substr($saVarName,  $iK + $iOffset,  $iVarLen, "UTF-8"), "UTF-8");

                if (mb_strlen($saRoot, "UTF-8") > 0) {
          $saDepthKey = Cast::toStr($iBraceDepth);
                    if (isset($mDeclaredRootsByDepth[ $saDepthKey]) === false || $mDeclaredRootsByDepth[$saDepthKey] === null) {
            $mDeclaredRootsByDepth[$saDepthKey] = JSOL::dict();
          }
          if (isset($mDeclaredRootsByDepth[$saDepthKey][ $saRoot]) === true) {
            $saExistingType = $mDeclaredRootsByDepth[$saDepthKey][$saRoot];
                        if ($saExistingType !== $saPrefix) {
              $aErrors[] =  Str::concat("Linter Error: Root name collision for '",  $saRoot,  "' with different types ('",  $saExistingType,  "' vs '",  $saPrefix,  "') at scope depth ",  $saDepthKey,  ".");
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
  return JSOL::dict("valid",  count($aErrors) === 0,  "errors",  $aErrors,  "warnings",  $aWarnings);
};
