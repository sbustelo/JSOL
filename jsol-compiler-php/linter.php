<?php
// @JSOL v0.2.93 - Self-Hosted Compiler Linter Module (regex-free)
$bIsWordChar = function($sCh) {
    if ($sCh === "") { return false; }
    $iCode = mb_ord(mb_substr($sCh,  0, 1, "UTF-8"));
    if ($iCode >= 48 && $iCode <= 57) { return true; }
    if ($iCode >= 65 && $iCode <= 90) { return true; }
    if ($iCode >= 97 && $iCode <= 122) { return true; }
    if ($iCode === 95) { return true; }
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
        } else {
            $bSkipping = false;
        }
    }

    if (mb_substr($sSourceCode,  $i,  2, "UTF-8") === "//") {
        $iLineEnd = $i;
        $bScanning = true;
        while ($iLineEnd < $iLen && $bScanning === true) {
            if (mb_substr($sSourceCode,  $iLineEnd,  1, "UTF-8") === "\n") {
                $bScanning = false;
            } else {
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
    return JSOL::dict("valid", count($aErrors) === 0, "errors", $aErrors);
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

    return JSOL::dict("valid", count($aErrors) === 0, "errors", $aErrors);
};