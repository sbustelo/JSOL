// @JSOL v0.2.94 - Self-Hosted Compiler Linter Module (Dynamic SSOT Validation)
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
    return JSOL.dict("valid",  $aErrors.length === 0,  "errors",  $aErrors);
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

    return JSOL.dict("valid",  $aErrors.length === 0,  "errors",  $aErrors);
};

const $mAuditStrictTyping = function($sMaskedCode, $mSSOT) {
    
    const $aErrors = [];
    const $iLen = $sMaskedCode.length;
    
    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        if ($sMaskedCode.substring( $i, ( $i) + ( 1)) === "$") {
            let $iJ = $i + 1;
            while ($iJ < $iLen && $bIsWordChar($sMaskedCode.substring( $iJ, ( $iJ) + ( 1)))) {
                $iJ = $iJ + 1;
            }
            const $sVarName = $sMaskedCode.substring( $i, ( $i) + ( $iJ - $i));
            
            if ($sVarName.indexOf( '$_') === 0) {
                let $iBack = $i - 1;
                while ($iBack >= 0 && ($sMaskedCode.substring( $iBack, ( $iBack) + ( 1)) === " " || $sMaskedCode.substring( $iBack, ( $iBack) + ( 1)) === "\t" || $sMaskedCode.substring( $iBack, ( $iBack) + ( 1)) === "\n")) {
                    $iBack = $iBack - 1;
                }
                if ($iBack >= 2 && $sMaskedCode.substring( $iBack - 2, ( $iBack - 2) + ( 3)) === "let") {
                    $aErrors.push( "Linter Error: Variable '" + $sVarName + "' uses reserved internal prefix '" + '$_' + "' in declaration.");
                } else if ($iBack >= 4 && $sMaskedCode.substring( $iBack - 4, ( $iBack - 4) + ( 5)) === "const") {
                    $aErrors.push( "Linter Error: Variable '" + $sVarName + "' uses reserved internal prefix '" + '$_' + "' in declaration.");
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
                } else {
                    break;
                }
            }

            if ($sPrefix.length === 0) {
                if ($sVarName.length > 1) {
                    $aErrors.push( "Linter Error: Variable '" + $sVarName + "' lacks a valid lowercase type prefix.");
                }
            } else {
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
                
                if ($bValid === false) {
                    $aErrors.push( "Linter Error: Unknown type prefix '" + $sPrefix + "' in variable '" + $sVarName + "'. No truncation fallback allowed.");
                }
            }
            $i = $iJ - 1;
        }
    }
    return JSOL.dict("valid",  $aErrors.length === 0,  "errors",  $aErrors);
};