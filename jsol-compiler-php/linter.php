<?php
// @JSOL v0.2.94 - Self-Hosted Compiler Linter Module (Dynamic SSOT Validation)
$bIsWordChar = function($sCh) {
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
    $iLen = mb_strlen($sSourceCode, "UTF-8");

    $i = 0;
    $bSkipping = true;
    while ($i < $iLen && $bSkipping === true) {
    $sC = mb_substr($sSourceCode,  $i,  1, "UTF-8");
        if ($sC === " " || $sC === "\t" || $sC === "\n" || $sC === "\r") {
      $i = $i + 1;
    }
    else {
      $bSkipping = false;
    }
  }
  if (mb_substr($sSourceCode,  $i,  2, "UTF-8") === "//") {
    $iLineEnd = $i;
        $bScanning = true;
        while ($iLineEnd < $iLen && $bScanning === true) {
      if (mb_substr($sSourceCode,  $iLineEnd,  1, "UTF-8") === "\n") {
        $bScanning = false;
      }
      else {
        $iLineEnd = $iLineEnd + 1;
      }
    }
    $sFirstLine = mb_substr($sSourceCode,  $i,  $iLineEnd - $i, "UTF-8");
        if (JSOL::strIndexOf($sFirstLine,  "@JSOL") !== -1 || JSOL::strIndexOf($sFirstLine,  "// JSOL") !== -1) {
      $bHasPragma = true;
    }
  }
  if ($bHasPragma === false) {
    $aErrors[] =  "Fatal: Missing MANDATORY @JSOL pragma on Line 1.";
  }
  return JSOL::dict("valid",  count($aErrors) === 0,  "errors",  $aErrors);
};
$mAuditForbiddenPatterns = function($sMaskedCode) {
  $aErrors = [];

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
            if ($bIsWordChar($sNextChar) === false) {
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
  return JSOL::dict("valid",  count($aErrors) === 0,  "errors",  $aErrors);
};
$mAuditStrictTyping = function($sMaskedCode, $mSSOT) use (&$bIsWordChar) {
  $aErrors = [];
    $iLen = mb_strlen($sMaskedCode, "UTF-8");
    
    for ($i = 0; $i < $iLen; $i = $i + 1) {
    if (mb_substr($sMaskedCode,  $i,  1, "UTF-8") === "$") {
      $iJ = $i + 1;
            while ($iJ < $iLen && $bIsWordChar(mb_substr($sMaskedCode,  $iJ,  1, "UTF-8"))) {
        $iJ = $iJ + 1;
      }
      $sVarName = mb_substr($sMaskedCode,  $i,  $iJ - $i, "UTF-8");
            
            if (JSOL::strIndexOf($sVarName,  '$_') === 0) {
        $iBack = $i - 1;
                while ($iBack >= 0 && (mb_substr($sMaskedCode,  $iBack,  1, "UTF-8") === " " || mb_substr($sMaskedCode,  $iBack,  1, "UTF-8") === "\t" || mb_substr($sMaskedCode,  $iBack,  1, "UTF-8") === "\n")) {
          $iBack = $iBack - 1;
        }
        if ($iBack >= 2 && mb_substr($sMaskedCode,  $iBack - 2,  3, "UTF-8") === "let") {
          $aErrors[] =  "Linter Error: Variable '" . $sVarName . "' uses reserved internal prefix '" . '$_' . "' in declaration.";
        }
        else if ($iBack >= 4 && mb_substr($sMaskedCode,  $iBack - 4,  5, "UTF-8") === "const") {
          $aErrors[] =  "Linter Error: Variable '" . $sVarName . "' uses reserved internal prefix '" . '$_' . "' in declaration.";
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
        if ($bValid === false) {
          $aErrors[] =  "Linter Error: Unknown type prefix '" . $sPrefix . "' in variable '" . $sVarName . "'. No truncation fallback allowed.";
        }
      }
      $i = $iJ - 1;
    }
  }
  return JSOL::dict("valid",  count($aErrors) === 0,  "errors",  $aErrors);
};
