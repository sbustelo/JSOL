// @JSOL v0.2.93 - Self-Hosted JS Target Compiler (Pure JSOL)
const $sCompileToJS = function($sMaskedCode, $sPrefix, $sSuffix) {
    
    
    const $fProcessBlock = function($sCode, $sKeyword, $bUnwrap) {
        let $sResult = $sCode;
        let $bContinue = true;
        while ($bContinue === true) {
            const $iStartIdx = $sResult.indexOf( $sKeyword);
            
            if ($iStartIdx === -1) {
                $bContinue = false;
            } else {
                const $iTailLen = $sResult.length - $iStartIdx;
                const $sTail = $sResult.substring( $iStartIdx, ( $iStartIdx) + ( $iTailLen));
                const $iRelOpenBrace = $sTail.indexOf( "{");
                const $iOpenBrace = $iRelOpenBrace === -1 ? -1 : $iStartIdx + $iRelOpenBrace;
                
                if ($iOpenBrace === -1) {
                    $bContinue = false;
                } else {
                    let $iBraceCount = 1;
                    let $iCloseBrace = -1;
                    const $iRLen = $sResult.length;
                    for (let $i = $iOpenBrace + 1; $i < $iRLen; $i = $i + 1) {
                        const $sChar = $sResult.substring( $i, ( $i) + ( 1));
                        if ($sChar === "{") { $iBraceCount = $iBraceCount + 1; }
                        if ($sChar === "}") { $iBraceCount = $iBraceCount - 1; }
                        if ($iBraceCount === 0) {
                            $iCloseBrace = $i;
                            break;
                        }
                    }
                    
                    if ($iCloseBrace === -1) {
                        $bContinue = false;
                    } else {
                        let $iEndIdx = $iCloseBrace + 1;
                        let $bFindingEnd = true;
                        while ($iEndIdx < $iRLen && $bFindingEnd === true) {
                            const $sChar = $sResult.substring( $iEndIdx, ( $iEndIdx) + ( 1));
                            if ($sChar === " " || $sChar === "\n" || $sChar === "\r" || $sChar === ")" || $sChar === ";") {
                                $iEndIdx = $iEndIdx + 1;
                            } else {
                                $bFindingEnd = false;
                            }
                        }
                        
                        const $sBefore = $sResult.substring( 0, ( 0) + ( $iStartIdx));
                        const $iAfterLen = $sResult.length - $iEndIdx;
                        const $sAfter = $sResult.substring( $iEndIdx, ( $iEndIdx) + ( $iAfterLen));
                        
                        if ($bUnwrap === true) {
                            const $iInnerLen = $iCloseBrace - $iOpenBrace - 1;
                            const $sInner = $sResult.substring( $iOpenBrace + 1, ( $iOpenBrace + 1) + ( $iInnerLen));
                            $sResult = $sBefore + "" + $sInner + "" + $sAfter;
                        } else {
                            $sResult = $sBefore + "" + $sAfter;
                        }
                    }
                }
            }
        }
        return $sResult;
    };

    const $fProcessCall = function($sCode, $sKeyword, $sType) {
        let $sResult = $sCode;
        let $bContinue = true;
        while ($bContinue === true) {
            const $iStartIdx = $sResult.indexOf( $sKeyword);
            if ($iStartIdx === -1) {
                $bContinue = false;
            } else {
                const $iKwLen = $sKeyword.length;
                const $iOpenParen = $iStartIdx + $iKwLen - 1;
                let $iParenCount = 1;
                let $iBracketCount = 0;
                let $iBraceCount = 0;
                let $bInStr = false;
                let $iCloseParen = -1;
                let $aArgs = [];
                let $iCurrentArgStart = $iOpenParen + 1;
                const $iRLen = $sResult.length;
                
                for (let $i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
                    const $sChar = $sResult.substring( $i, ( $i) + ( 1));
                    const $sPrev = $sResult.substring( $i - 1, ( $i - 1) + ( 1));
                    
                    if ($sChar === "\"" && $sPrev !== "\\") { $bInStr = !$bInStr; }
                    
                    if ($bInStr === false) {
                        if ($sChar === "(") { $iParenCount = $iParenCount + 1; }
                        if ($sChar === ")") { $iParenCount = $iParenCount - 1; }
                        if ($sChar === "[") { $iBracketCount = $iBracketCount + 1; }
                        if ($sChar === "]") { $iBracketCount = $iBracketCount - 1; }
                        if ($sChar === "{") { $iBraceCount = $iBraceCount + 1; }
                        if ($sChar === "}") { $iBraceCount = $iBraceCount - 1; }
                    }
                    
                    if ($sChar === "," && $iParenCount === 1 && $iBracketCount === 0 && $iBraceCount === 0 && $bInStr === false) {
                        const $iArgLen1 = $i - $iCurrentArgStart;
                        const $sArgVal1 = $sResult.substring( $iCurrentArgStart, ( $iCurrentArgStart) + ( $iArgLen1));
                        $aArgs.push( $sArgVal1);
                        $iCurrentArgStart = $i + 1;
                    } else if ($iParenCount === 0) {
                        const $iArgLen2 = $i - $iCurrentArgStart;
                        const $sArgVal2 = $sResult.substring( $iCurrentArgStart, ( $iCurrentArgStart) + ( $iArgLen2));
                        $aArgs.push( $sArgVal2);
                        $iCloseParen = $i;
                        break;
                    }
                }
                
                if ($iCloseParen === -1) {
                    $bContinue = false;
                } else {
                    const $sBefore = $sResult.substring( 0, ( 0) + ( $iStartIdx));
                    const $iAfterLen = $sResult.length - $iCloseParen - 1;
                    const $sAfter = $sResult.substring( $iCloseParen + 1, ( $iCloseParen + 1) + ( $iAfterLen));
                    
                    let $sRep = "";
                    if ($sType === "sub") { $sRep = $aArgs[0] + ".substring(" + $aArgs[1] + ", (" + $aArgs[1] + ") + (" + $aArgs[2] + "))"; }
                    else if ($sType === "len") { $sRep = $aArgs[0] + ".length"; }
                    else if ($sType === "char") { $sRep = $aArgs[0] + ".charCodeAt(" + $aArgs[1] + ")"; }
                    else if ($sType === "idx") { $sRep = $aArgs[0] + ".indexOf(" + $aArgs[1] + ")"; }
                    else if ($sType === "rep") { $sRep = $aArgs[0] + ".split(" + $aArgs[1] + ").join(" + $aArgs[2] + ")"; }
                    else if ($sType === "push") { $sRep = $aArgs[0] + ".push(" + $aArgs[1] + ")"; }
                    else if ($sType === "pop") { $sRep = $aArgs[0] + ".pop()"; }
                    else if ($sType === "shift") { $sRep = $aArgs[0] + ".shift()"; }
                    else if ($sType === "arridx") { $sRep = $aArgs[0] + ".indexOf(" + $aArgs[1] + ")"; }
                    else if ($sType === "mapkeys") { $sRep = "Object.keys(" + $aArgs[0] + ")"; }
                    else if ($sType === "haskey") { $sRep = "Object.prototype.hasOwnProperty.call(" + $aArgs[0] + ", " + $aArgs[1] + ")"; }
                    else if ($sType === "fromchar") { $sRep = "String.fromCharCode(" + $aArgs[0] + ")"; }
                    else if ($sType === "upper") { $sRep = $aArgs[0] + ".toUpperCase()"; }
                    else if ($sType === "lower") { $sRep = $aArgs[0] + ".toLowerCase()"; }
                    else if ($sType === "toint") { $sRep = "parseInt(" + $aArgs[0] + ", 10)"; }
                    else if ($sType === "tostr") { $sRep = "String(" + $aArgs[0] + ")"; }
                    else if ($sType === "slice") { $sRep = $aArgs[0] + ".slice(" + $aArgs[1] + ", " + $aArgs[2] + ")"; }
                    else if ($sType === "trim") { $sRep = $aArgs[0] + ".trim()"; }
                    else if ($sType === "split") { $sRep = $aArgs[0] + ".split(" + $aArgs[1] + ")"; }
                    else if ($sType === "join") { $sRep = $aArgs[0] + ".join(" + $aArgs[1] + ")"; }
                    else if ($sType === "tofloat") { $sRep = "parseFloat(" + $aArgs[0] + ")"; }
                    else if ($sType === "bitand") { $sRep = "(" + $aArgs[0] + " & " + $aArgs[1] + ")"; }
                    else if ($sType === "bitor") { $sRep = "(" + $aArgs[0] + " | " + $aArgs[1] + ")"; }
                    else if ($sType === "bitxor") { $sRep = "(" + $aArgs[0] + " ^ " + $aArgs[1] + ")"; }
                    else if ($sType === "bitnot") { $sRep = "(~" + $aArgs[0] + ")"; }
                    else if ($sType === "bitshiftl") { $sRep = "(" + $aArgs[0] + " << " + $aArgs[1] + ")"; }
                    else if ($sType === "bitshiftr") { $sRep = "(" + $aArgs[0] + " >> " + $aArgs[1] + ")"; }
                    else if ($sType === "noop") { $sRep = "/* mem-op */"; }
                    
                    $sResult = $sBefore + "" + $sRep + "" + $sAfter;
                }
            }
        }
        return $sResult;
    };

    let $sTransformed = $sMaskedCode;
    
    $sTransformed = $fProcessBlock($sTransformed, "JSOL.PHP", false);
    $sTransformed = $fProcessBlock($sTransformed, "JSOL.JS", true);

    $sTransformed = $sRegexReplace("JSOL\\.use\\s*\\([^)]+\\)\\s*;?", "", $sTransformed, "g");

    $sTransformed = $sTransformed.split( "Map.create(").join( "JSOL.dict(");
    
    $sTransformed = $sTransformed.split( "Regex.match(").join( "$" + "mRegex.match(");
    $sTransformed = $sTransformed.split( "Regex.test(").join( "$" + "mRegex.test(");

    $sTransformed = $fProcessCall($sTransformed, "JSOL.set(", "noop");
    $sTransformed = $fProcessCall($sTransformed, "JSOL.unset(", "noop");

    $sTransformed = $fProcessCall($sTransformed, "Str.sub(", "sub");
    $sTransformed = $fProcessCall($sTransformed, "Str.len(", "len");
    $sTransformed = $fProcessCall($sTransformed, "JSOL.len(", "len");
    $sTransformed = $fProcessCall($sTransformed, "Arr.count(", "len");
    $sTransformed = $fProcessCall($sTransformed, "JSOL.count(", "len");
    $sTransformed = $fProcessCall($sTransformed, "Str.char(", "char");
    $sTransformed = $fProcessCall($sTransformed, "Str.indexOf(", "idx");
    $sTransformed = $fProcessCall($sTransformed, "Str.replace(", "rep");
    $sTransformed = $fProcessCall($sTransformed, "Arr.push(", "push");
    $sTransformed = $fProcessCall($sTransformed, "Arr.pop(", "pop");
    $sTransformed = $fProcessCall($sTransformed, "Arr.shift(", "shift");
    $sTransformed = $fProcessCall($sTransformed, "Arr.indexOf(", "arridx");
    $sTransformed = $fProcessCall($sTransformed, "Map.keys(", "mapkeys");
    $sTransformed = $fProcessCall($sTransformed, "Map.has(", "haskey");
    $sTransformed = $fProcessCall($sTransformed, "JSOL.hasKey(", "haskey");
    $sTransformed = $fProcessCall($sTransformed, "Str.fromChar(", "fromchar");
    $sTransformed = $fProcessCall($sTransformed, "Str.upper(", "upper");
    $sTransformed = $fProcessCall($sTransformed, "Str.lower(", "lower");
    $sTransformed = $fProcessCall($sTransformed, "Str.trim(", "trim");
    $sTransformed = $fProcessCall($sTransformed, "Str.split(", "split");
    $sTransformed = $fProcessCall($sTransformed, "Arr.join(", "join");
    $sTransformed = $fProcessCall($sTransformed, "Arr.slice(", "slice");
    $sTransformed = $fProcessCall($sTransformed, "Cast.toInt(", "toint");
    $sTransformed = $fProcessCall($sTransformed, "Cast.toStr(", "tostr");
    $sTransformed = $fProcessCall($sTransformed, "Cast.toFloat(", "tofloat");
    $sTransformed = $fProcessCall($sTransformed, "Bit.and(", "bitand");
    $sTransformed = $fProcessCall($sTransformed, "Bit.or(", "bitor");
    $sTransformed = $fProcessCall($sTransformed, "Bit.xor(", "bitxor");
    $sTransformed = $fProcessCall($sTransformed, "Bit.not(", "bitnot");
    $sTransformed = $fProcessCall($sTransformed, "Bit.shiftL(", "bitshiftl");
    $sTransformed = $fProcessCall($sTransformed, "Bit.shiftR(", "bitshiftr");

    const $sFinalOutput = $sPrefix + "" + $sTransformed + "" + $sSuffix;
    return $sFinalOutput;
};