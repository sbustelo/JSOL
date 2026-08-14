// @JSOL v0.2.93 - Self-Hosted Compiler Linter Module (regex-free)
const $bIsWordChar = function($sCh) {
    if ($sCh === "") { return false; }
    const $iCode = $sCh.charCodeAt( 0);
    if ($iCode >= 48 && $iCode <= 57) { return true; }
    if ($iCode >= 65 && $iCode <= 90) { return true; }
    if ($iCode >= 97 && $iCode <= 122) { return true; }
    if ($iCode === 95) { return true; }
    return false;
};

const $mAuditPragma = function($sSourceCode) {
    const $aErrors = [];
    let $bHasPragma = false;
    const $iLen = $sSourceCode.length;

    let $i = 0;
    let $bSkipping = true;
    while ($i < $iLen && $bSkipping === true) {
        const $sC = $sSourceCode.substring( $i, ( $i) + ( 1));
        if ($sC === " " || $sC === "\t" || $sC === "\n" || $sC === "\r") {
            $i = $i + 1;
        } else {
            $bSkipping = false;
        }
    }

    if ($sSourceCode.substring( $i, ( $i) + ( 2)) === "//") {
        let $iLineEnd = $i;
        let $bScanning = true;
        while ($iLineEnd < $iLen && $bScanning === true) {
            if ($sSourceCode.substring( $iLineEnd, ( $iLineEnd) + ( 1)) === "\n") {
                $bScanning = false;
            } else {
                $iLineEnd = $iLineEnd + 1;
            }
        }
        const $sFirstLine = $sSourceCode.substring( $i, ( $i) + ( $iLineEnd - $i));
        if ($sFirstLine.indexOf( "@JSOL") !== -1 || $sFirstLine.indexOf( "// JSOL") !== -1) {
            $bHasPragma = true;
        }
    }

    if ($bHasPragma === false) {
        $aErrors.push( "Fatal: Missing MANDATORY @JSOL pragma on Line 1.");
    }
    return JSOL.dict("valid", $aErrors.length === 0, "errors", $aErrors);
};

const $mAuditForbiddenPatterns = function($sMaskedCode) {
    const $aErrors = [];

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
            if ($bIsWordChar($sNextChar) === false) {
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

    return JSOL.dict("valid", $aErrors.length === 0, "errors", $aErrors);
};