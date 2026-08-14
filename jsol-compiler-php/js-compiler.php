<?php
// @JSOL v0.2.93 - Self-Hosted JS Target Compiler (Pure JSOL)
$sCompileToJS = function($sMaskedCode, $sPrefix, $sSuffix) use ($sRegexReplace) {

    
    $fProcessBlock = function($sCode, $sKeyword, $bUnwrap) {
        $sResult = $sCode;
        $bContinue = true;
        while ($bContinue === true) {
            $iStartIdx = JSOL::strIndexOf($sResult,  $sKeyword);
            
            if ($iStartIdx === -1) {
                $bContinue = false;
            } else {
                $iTailLen = mb_strlen($sResult, "UTF-8") - $iStartIdx;
                $sTail = mb_substr($sResult,  $iStartIdx,  $iTailLen, "UTF-8");
                $iRelOpenBrace = JSOL::strIndexOf($sTail,  "{");
                $iOpenBrace = $iRelOpenBrace === -1 ? -1 : $iStartIdx + $iRelOpenBrace;
                
                if ($iOpenBrace === -1) {
                    $bContinue = false;
                } else {
                    $iBraceCount = 1;
                    $iCloseBrace = -1;
                    $iRLen = mb_strlen($sResult, "UTF-8");
                    for ($i = $iOpenBrace + 1; $i < $iRLen; $i = $i + 1) {
                        $sChar = mb_substr($sResult,  $i,  1, "UTF-8");
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
                        $iEndIdx = $iCloseBrace + 1;
                        $bFindingEnd = true;
                        while ($iEndIdx < $iRLen && $bFindingEnd === true) {
                            $sChar = mb_substr($sResult,  $iEndIdx,  1, "UTF-8");
                            if ($sChar === " " || $sChar === "\n" || $sChar === "\r" || $sChar === ")" || $sChar === ";") {
                                $iEndIdx = $iEndIdx + 1;
                            } else {
                                $bFindingEnd = false;
                            }
                        }
                        
                        $sBefore = mb_substr($sResult,  0,  $iStartIdx, "UTF-8");
                        $iAfterLen = mb_strlen($sResult, "UTF-8") - $iEndIdx;
                        $sAfter = mb_substr($sResult,  $iEndIdx,  $iAfterLen, "UTF-8");
                        
                        if ($bUnwrap === true) {
                            $iInnerLen = $iCloseBrace - $iOpenBrace - 1;
                            $sInner = mb_substr($sResult,  $iOpenBrace + 1,  $iInnerLen, "UTF-8");
                            $sResult = $sBefore . "" . $sInner . "" . $sAfter;
                        } else {
                            $sResult = $sBefore . "" . $sAfter;
                        }
                    }
                }
            }
        }
        return $sResult;
    };

    $fProcessCall = function($sCode, $sKeyword, $sType) {
        $sResult = $sCode;
        $bContinue = true;
        while ($bContinue === true) {
            $iStartIdx = JSOL::strIndexOf($sResult,  $sKeyword);
            if ($iStartIdx === -1) {
                $bContinue = false;
            } else {
                $iKwLen = mb_strlen($sKeyword, "UTF-8");
                $iOpenParen = $iStartIdx + $iKwLen - 1;
                $iParenCount = 1;
                $iBracketCount = 0;
                $iBraceCount = 0;
                $bInStr = false;
                $iCloseParen = -1;
                $aArgs = [];
                $iCurrentArgStart = $iOpenParen + 1;
                $iRLen = mb_strlen($sResult, "UTF-8");
                
                for ($i = $iOpenParen + 1; $i < $iRLen; $i = $i + 1) {
                    $sChar = mb_substr($sResult,  $i,  1, "UTF-8");
                    $sPrev = mb_substr($sResult,  $i - 1,  1, "UTF-8");
                    
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
                        $iArgLen1 = $i - $iCurrentArgStart;
                        $sArgVal1 = mb_substr($sResult,  $iCurrentArgStart,  $iArgLen1, "UTF-8");
                        $aArgs[] =  $sArgVal1;
                        $iCurrentArgStart = $i + 1;
                    } else if ($iParenCount === 0) {
                        $iArgLen2 = $i - $iCurrentArgStart;
                        $sArgVal2 = mb_substr($sResult,  $iCurrentArgStart,  $iArgLen2, "UTF-8");
                        $aArgs[] =  $sArgVal2;
                        $iCloseParen = $i;
                        break;
                    }
                }
                
                if ($iCloseParen === -1) {
                    $bContinue = false;
                } else {
                    $sBefore = mb_substr($sResult,  0,  $iStartIdx, "UTF-8");
                    $iAfterLen = mb_strlen($sResult, "UTF-8") - $iCloseParen - 1;
                    $sAfter = mb_substr($sResult,  $iCloseParen + 1,  $iAfterLen, "UTF-8");
                    
                    $sRep = "";
                    if ($sType === "sub") { $sRep = $aArgs[0] . ".substring(" . $aArgs[1] . ", (" . $aArgs[1] . ") + (" . $aArgs[2] . "))"; }
                    else if ($sType === "len") { $sRep = $aArgs[0] . ".length"; }
                    else if ($sType === "char") { $sRep = $aArgs[0] . ".charCodeAt(" . $aArgs[1] . ")"; }
                    else if ($sType === "idx") { $sRep = $aArgs[0] . ".indexOf(" . $aArgs[1] . ")"; }
                    else if ($sType === "rep") { $sRep = $aArgs[0] . ".split(" . $aArgs[1] . ").join(" . $aArgs[2] . ")"; }
                    else if ($sType === "push") { $sRep = $aArgs[0] . ".push(" . $aArgs[1] . ")"; }
                    else if ($sType === "pop") { $sRep = $aArgs[0] . ".pop()"; }
                    else if ($sType === "shift") { $sRep = $aArgs[0] . ".shift()"; }
                    else if ($sType === "arridx") { $sRep = $aArgs[0] . ".indexOf(" . $aArgs[1] . ")"; }
                    else if ($sType === "mapkeys") { $sRep = "Object.keys(" . $aArgs[0] . ")"; }
                    else if ($sType === "haskey") { $sRep = "Object.prototype.hasOwnProperty.call(" . $aArgs[0] . ", " . $aArgs[1] . ")"; }
                    else if ($sType === "fromchar") { $sRep = "String.fromCharCode(" . $aArgs[0] . ")"; }
                    else if ($sType === "upper") { $sRep = $aArgs[0] . ".toUpperCase()"; }
                    else if ($sType === "lower") { $sRep = $aArgs[0] . ".toLowerCase()"; }
                    else if ($sType === "toint") { $sRep = "parseInt(" . $aArgs[0] . ", 10)"; }
                    else if ($sType === "tostr") { $sRep = "String(" . $aArgs[0] . ")"; }
                    else if ($sType === "slice") { $sRep = $aArgs[0] . ".slice(" . $aArgs[1] . ", " . $aArgs[2] . ")"; }
                    else if ($sType === "trim") { $sRep = $aArgs[0] . ".trim()"; }
                    else if ($sType === "split") { $sRep = $aArgs[0] . ".split(" . $aArgs[1] . ")"; }
                    else if ($sType === "join") { $sRep = $aArgs[0] . ".join(" . $aArgs[1] . ")"; }
                    else if ($sType === "tofloat") { $sRep = "parseFloat(" . $aArgs[0] . ")"; }
                    else if ($sType === "bitand") { $sRep = "(" . $aArgs[0] . " & " . $aArgs[1] . ")"; }
                    else if ($sType === "bitor") { $sRep = "(" . $aArgs[0] . " | " . $aArgs[1] . ")"; }
                    else if ($sType === "bitxor") { $sRep = "(" . $aArgs[0] . " ^ " . $aArgs[1] . ")"; }
                    else if ($sType === "bitnot") { $sRep = "(~" . $aArgs[0] . ")"; }
                    else if ($sType === "bitshiftl") { $sRep = "(" . $aArgs[0] . " << " . $aArgs[1] . ")"; }
                    else if ($sType === "bitshiftr") { $sRep = "(" . $aArgs[0] . " >> " . $aArgs[1] . ")"; }
                    else if ($sType === "noop") { $sRep = "/* mem-op */"; }
                    
                    $sResult = $sBefore . "" . $sRep . "" . $sAfter;
                }
            }
        }
        return $sResult;
    };

    $sTransformed = $sMaskedCode;
    
    $sTransformed = $fProcessBlock($sTransformed, "JSOL.PHP", false);
    $sTransformed = $fProcessBlock($sTransformed, "JSOL.JS", true);

    $sTransformed = $sRegexReplace("JSOL\\.use\\s*\\([^)]+\\)\\s*;?", "", $sTransformed, "g");

    $sTransformed = str_replace( "Map.create(",  "JSOL.dict(", $sTransformed);
    
    $sTransformed = str_replace( "Regex.match(",  "$" . "mRegex.match(", $sTransformed);
    $sTransformed = str_replace( "Regex.test(",  "$" . "mRegex.test(", $sTransformed);

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

    $sFinalOutput = $sPrefix . "" . $sTransformed . "" . $sSuffix;
    return $sFinalOutput;
};