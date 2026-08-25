// @JSOL v0.2.96

/**
 @description
 Thompson NFA Regular Expression Virtual Machine.
 Parses a subset of regular expressions (concatenation, alternation,
 Kleene star, optionals, and capture groups) into bytecode, and evaluates 
 strings against that automaton in O(N) time.
 
 Originally written to ensure the platform could boot from a JSOL self-hosted compiler. Once proven, the architecture safely migrated to native `Regex.*` engine delegation. This engine remains as a pure-JSOL reference implementation of a bytecode parser and VM.

 TODO: Implement missing features required for parity with the current native safe subset (e.g., {n,m} quantifiers, \b/\B boundaries). Additionally, restrict the . (dot) wildcard so it correctly excludes line terminators (\n, \r) by default, aligning with standard regex behavior. Achieving this parity is strictly required to eventually support Lua as a target, since Lua lacks native POSIX regex support and will rely on this VM at runtime.

@param {string} $sPatternStr - The regex pattern to compile and search.
@param {string} $sReplacementStr - The replacement string (supports capture group references like $1, $2).
@param {string} $sStr - The target text to operate on.
@param {string} $sFlags - Execution flags (e.g., "g" for global replacement).
@returns {string} - The resulting string after applying the replacements.
*/

/**
 @contract
 {
   "cases": [
     { "$sPatternStr": "([a-z]+)-([0-9]+)", "$sReplacementStr": "$2:$1", "$sStr": "id-42 and user-99", "$sFlags": "g" },
     { "$sPatternStr": "\\s+", "$sReplacementStr": "-", "$sStr": "hello   world", "$sFlags": "g" },
     { "$sPatternStr": "a(b|c)*d", "$sReplacementStr": "MATCH", "$sStr": "z abbbcd z", "$sFlags": "g" }
   ]
 }
*/

const $mParseAtom = function($sPat, $i, $iN, $iGc, $mFns) {
    const $sC = Str.sub($sPat, $i, 1);
    if ($sC === "(") {
        $i = $i + 1;
        let $bCapturing = true;
        if ($i + 1 < $iN && Str.sub($sPat, $i, 2) === "?:") {
            $bCapturing = false;
            $i = $i + 2;
        }
        let $iIdx = -1;
        if ($bCapturing === true) {
            $iGc = $iGc + 1;
            $iIdx = $iGc;
        }
        const $fPAltFn = $mFns["parseAlt"];
        let $mR = $fPAltFn($sPat, $i, $iN, $iGc, $mFns);
        const $mBody = $mR["node"];
        $i = $mR["i"];
        $iGc = $mR["groupCount"];
        $i = $i + 1;
        return Map.create("node", Map.create("type", "group", "index", $iIdx, "capturing", $bCapturing, "body", $mBody), "i", $i, "groupCount", $iGc);
    }
    if ($sC === "[") {
        $i = $i + 1;
        let $bNegate = false;
        if ($i < $iN && Str.sub($sPat, $i, 1) === "^") {
            $bNegate = true;
            $i = $i + 1;
        }
        let $aRanges = [];
        let $aSingles = [];
        let $bFirst = true;
        while ($i < $iN && (Str.sub($sPat, $i, 1) !== "]" || $bFirst)) {
            $bFirst = false;
            let $sCh = Str.sub($sPat, $i, 1);
            let $bIsShorthand = false;
            if ($sCh === "\\") {
                $i = $i + 1;
                const $sE = Str.sub($sPat, $i, 1);
                if ($sE === "d") {
                    const $aR09 = ["0", "9"]; Arr.push($aRanges, $aR09);
                    $bIsShorthand = true;
                    $i = $i + 1;
                } else if ($sE === "w") {
                    const $aRaz = ["a", "z"]; Arr.push($aRanges, $aRaz);
                    const $aRAZ = ["A", "Z"]; Arr.push($aRanges, $aRAZ);
                    const $aR09w = ["0", "9"]; Arr.push($aRanges, $aR09w);
                    Arr.push($aSingles, "_");
                    $bIsShorthand = true;
                    $i = $i + 1;
                } else if ($sE === "s") {
                    Arr.push($aSingles, " "); Arr.push($aSingles, "\t"); Arr.push($aSingles, "\n"); Arr.push($aSingles, "\r");
                    $bIsShorthand = true;
                    $i = $i + 1;
                } else {
                    $sCh = $sE;
                    $i = $i + 1;
                }
            } else {
                $i = $i + 1;
            }
            if ($bIsShorthand === true) { continue; }
            if ($i < $iN && Str.sub($sPat, $i, 1) === "-" && $i + 1 < $iN && Str.sub($sPat, $i + 1, 1) !== "]") {
                $i = $i + 1;
                let $sCh2 = Str.sub($sPat, $i, 1);
                if ($sCh2 === "\\") {
                    $i = $i + 1;
                    $sCh2 = Str.sub($sPat, $i, 1);
                    $i = $i + 1;
                } else {
                    $i = $i + 1;
                }
                const $aRng = [$sCh, $sCh2];
                Arr.push($aRanges, $aRng);
            } else {
                Arr.push($aSingles, $sCh);
            }
        }
        $i = $i + 1;
        return Map.create("node", Map.create("type", "class", "negate", $bNegate, "ranges", $aRanges, "singles", $aSingles), "i", $i, "groupCount", $iGc);
    }
    if ($sC === ".") {
        $i = $i + 1;
        return Map.create("node", Map.create("type", "any"), "i", $i, "groupCount", $iGc);
    }
    if ($sC === "^") {
        $i = $i + 1;
        return Map.create("node", Map.create("type", "anchorStart"), "i", $i, "groupCount", $iGc);
    }
    if ($sC === "$") {
        $i = $i + 1;
        return Map.create("node", Map.create("type", "anchorEnd"), "i", $i, "groupCount", $iGc);
    }
    if ($sC === "\\") {
        $i = $i + 1;
        const $sE = Str.sub($sPat, $i, 1);
        $i = $i + 1;
        if ($sE === "d") { const $aRd = [["0", "9"]]; return Map.create("node", Map.create("type", "class", "negate", false, "ranges", $aRd, "singles", []), "i", $i, "groupCount", $iGc); }
        if ($sE === "w") { const $aRw = [["a", "z"], ["A", "Z"], ["0", "9"]]; const $aSw = ["_"]; return Map.create("node", Map.create("type", "class", "negate", false, "ranges", $aRw, "singles", $aSw), "i", $i, "groupCount", $iGc); }
        if ($sE === "s") { const $aSs = [" ", "\t", "\n", "\r"]; return Map.create("node", Map.create("type", "class", "negate", false, "ranges", [], "singles", $aSs), "i", $i, "groupCount", $iGc); }
        return Map.create("node", Map.create("type", "char", "value", $sE), "i", $i, "groupCount", $iGc);
    }
    $i = $i + 1;
    return Map.create("node", Map.create("type", "char", "value", $sC), "i", $i, "groupCount", $iGc);
};

const $mParseQuantified = function($sPat, $i, $iN, $iGc, $mFns) {
    const $fPaFn = $mFns["parseAtom"];
    let $mR = $fPaFn($sPat, $i, $iN, $iGc, $mFns);
    let $mAtom = $mR["node"];
    $i = $mR["i"];
    $iGc = $mR["groupCount"];

    while ($i < $iN) {
        const $sC = Str.sub($sPat, $i, 1);
        if ($sC === "*") {
            $i = $i + 1;
            let $bLazy = false;
            if ($i < $iN && Str.sub($sPat, $i, 1) === "?") { $bLazy = true; $i = $i + 1; }
            $mAtom = Map.create("type", "rep", "min", 0, "max", 999999, "lazy", $bLazy, "body", $mAtom);
        } else if ($sC === "+") {
            $i = $i + 1;
            let $bLazy = false;
            if ($i < $iN && Str.sub($sPat, $i, 1) === "?") { $bLazy = true; $i = $i + 1; }
            $mAtom = Map.create("type", "rep", "min", 1, "max", 999999, "lazy", $bLazy, "body", $mAtom);
        } else if ($sC === "?") {
            $i = $i + 1;
            let $bLazy = false;
            if ($i < $iN && Str.sub($sPat, $i, 1) === "?") { $bLazy = true; $i = $i + 1; }
            $mAtom = Map.create("type", "rep", "min", 0, "max", 1, "lazy", $bLazy, "body", $mAtom);
        } else {
            break;
        }
    }
    return Map.create("node", $mAtom, "i", $i, "groupCount", $iGc);
};

const $mParseConcat = function($sPat, $i, $iN, $iGc, $mFns) {
    let $aParts = [];
    const $fPqFn = $mFns["parseQuantified"];
    while ($i < $iN && Str.sub($sPat, $i, 1) !== "|" && Str.sub($sPat, $i, 1) !== ")") {
        let $mR = $fPqFn($sPat, $i, $iN, $iGc, $mFns);
        Arr.push($aParts, $mR["node"]);
        $i = $mR["i"];
        $iGc = $mR["groupCount"];
    }
    return Map.create("node", Map.create("type", "concat", "parts", $aParts), "i", $i, "groupCount", $iGc);
};

const $mParseAlt = function($sPat, $i, $iN, $iGc, $mFns) {
    let $aOptions = [];
    const $fPcFn = $mFns["parseConcat"];
    let $mR1 = $fPcFn($sPat, $i, $iN, $iGc, $mFns);
    Arr.push($aOptions, $mR1["node"]);
    $i = $mR1["i"];
    $iGc = $mR1["groupCount"];

    while ($i < $iN && Str.sub($sPat, $i, 1) === "|") {
        $i = $i + 1;
        let $mR2 = $fPcFn($sPat, $i, $iN, $iGc, $mFns);
        Arr.push($aOptions, $mR2["node"]);
        $i = $mR2["i"];
        $iGc = $mR2["groupCount"];
    }
    if (Arr.count($aOptions) === 1) { return Map.create("node", $aOptions[0], "i", $i, "groupCount", $iGc); }
    return Map.create("node", Map.create("type", "alt", "options", $aOptions), "i", $i, "groupCount", $iGc);
};

const $mParsePattern = function($sPat) {
    JSOL.use($mParseAlt, $mParseConcat, $mParseQuantified, $mParseAtom);
    const $mFns = Map.create(
        "parseAlt", $mParseAlt,
        "parseConcat", $mParseConcat,
        "parseQuantified", $mParseQuantified,
        "parseAtom", $mParseAtom
    );
    const $iN = Str.len($sPat);
    const $mR = $mParseAlt($sPat, 0, $iN, 0, $mFns);
    return Map.create("tree", $mR["node"], "groupCount", $mR["groupCount"]);
};

const $fGen = function($mN, $aProg, $fSelfFn) {
    const $sType = $mN["type"];
    if ($sType === "concat") {
        const $aParts = $mN["parts"];
        const $iPCount = Arr.count($aParts);
        for (let $iP = 0; $iP < $iPCount; $iP = $iP + 1) { 
            $aProg = $fSelfFn($aParts[$iP], $aProg, $fSelfFn); 
        }
    } else if ($sType === "alt") {
        const $aOptions = $mN["options"];
        const $iOCount = Arr.count($aOptions);
        let $aJmpEnds = [];
        for (let $iIdx = 0; $iIdx < $iOCount; $iIdx = $iIdx + 1) {
            if ($iIdx < $iOCount - 1) {
                const $iSplitPc = Arr.count($aProg);
                Arr.push($aProg, Map.create("op", "SPLIT", "x", 0, "y", 0));
                const $iX = Arr.count($aProg);
                $aProg = $fSelfFn($aOptions[$iIdx], $aProg, $fSelfFn);
                const $iJmpPc = Arr.count($aProg);
                Arr.push($aProg, Map.create("op", "JMP", "to", 0));
                Arr.push($aJmpEnds, $iJmpPc);
                $aProg[$iSplitPc]["x"] = $iX;
                $aProg[$iSplitPc]["y"] = Arr.count($aProg);
            } else {
                $aProg = $fSelfFn($aOptions[$iIdx], $aProg, $fSelfFn);
            }
        }
        const $iJCount = Arr.count($aJmpEnds);
        for (let $iJ = 0; $iJ < $iJCount; $iJ = $iJ + 1) {
            $aProg[$aJmpEnds[$iJ]]["to"] = Arr.count($aProg);
        }
    } else if ($sType === "rep") {
        const $iMin = $mN["min"];
        const $iMax = $mN["max"];
        const $bLazy = $mN["lazy"];
        for (let $iC = 0; $iC < $iMin; $iC = $iC + 1) { 
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn); 
        }
        if ($iMax === 999999) {
            const $iSplitPc = Arr.count($aProg);
            Arr.push($aProg, Map.create("op", "SPLIT", "x", 0, "y", 0));
            const $iBodyStart = Arr.count($aProg);
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
            Arr.push($aProg, Map.create("op", "JMP", "to", $iSplitPc));
            if ($bLazy === true) {
                $aProg[$iSplitPc]["x"] = Arr.count($aProg);
                $aProg[$iSplitPc]["y"] = $iBodyStart;
            } else {
                $aProg[$iSplitPc]["x"] = $iBodyStart;
                $aProg[$iSplitPc]["y"] = Arr.count($aProg);
            }
        } else {
            const $iOptional = $iMax - $iMin;
            for (let $iC = 0; $iC < $iOptional; $iC = $iC + 1) {
                const $iSplitPc = Arr.count($aProg);
                Arr.push($aProg, Map.create("op", "SPLIT", "x", 0, "y", 0));
                const $iBodyStart = Arr.count($aProg);
                $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
                if ($bLazy === true) {
                    $aProg[$iSplitPc]["x"] = Arr.count($aProg);
                    $aProg[$iSplitPc]["y"] = $iBodyStart;
                } else {
                    $aProg[$iSplitPc]["x"] = $iBodyStart;
                    $aProg[$iSplitPc]["y"] = Arr.count($aProg);
                }
            }
        }
    } else if ($sType === "group") {
        if (Map.has($mN, "capturing") && $mN["capturing"] === false) {
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
        } else {
            Arr.push($aProg, Map.create("op", "SAVE", "slot", $mN["index"] * 2));
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
            Arr.push($aProg, Map.create("op", "SAVE", "slot", $mN["index"] * 2 + 1));
        }
    } else if ($sType === "char") {
        Arr.push($aProg, Map.create("op", "CHAR", "value", $mN["value"]));
    } else if ($sType === "any") {
        Arr.push($aProg, Map.create("op", "ANY"));
    } else if ($sType === "class") {
        Arr.push($aProg, Map.create("op", "CLASS", "negate", $mN["negate"], "ranges", $mN["ranges"], "singles", $mN["singles"]));
    } else if ($sType === "anchorStart") {
        Arr.push($aProg, Map.create("op", "BOL"));
    } else if ($sType === "anchorEnd") {
        Arr.push($aProg, Map.create("op", "EOL"));
    }
    return $aProg;
};

const $aCompileRegex = function($mNode, $iGroupCount) {
    JSOL.use($fGen);
    let $aProg = [];
    Arr.push($aProg, Map.create("op", "SAVE", "slot", 0));
    $aProg = $fGen($mNode, $aProg, $fGen);
    Arr.push($aProg, Map.create("op", "SAVE", "slot", 1));
    Arr.push($aProg, Map.create("op", "MATCH"));
    return $aProg;
};

const $sToLower = function($sCh) {
    const $iCode = Str.char($sCh, 0);
    if ($iCode >= 65 && $iCode <= 90) { return Str.fromChar($iCode + 32); }
    return $sCh;
};

const $bCharMatches = function($mInstr, $sCh, $bCi) {
    JSOL.use($sToLower);
    let $bInSet = false;
    const $sChComp = $bCi === true ? $sToLower($sCh) : $sCh;
    const $iCCode = Str.char($sChComp, 0);

    const $aSingles = $mInstr["singles"];
    const $iSCount = Arr.count($aSingles);
    for (let $i = 0; $i < $iSCount; $i = $i + 1) {
        const $sS = $aSingles[$i];
        const $sSComp = $bCi === true ? $sToLower($sS) : $sS;
        if ($sSComp === $sChComp) { $bInSet = true; }
    }

    const $aRanges = $mInstr["ranges"];
    const $iRCount = Arr.count($aRanges);
    for (let $i = 0; $i < $iRCount; $i = $i + 1) {
        const $aR = $aRanges[$i];
        const $sA = $bCi === true ? $sToLower($aR[0]) : $aR[0];
        const $sB = $bCi === true ? $sToLower($aR[1]) : $aR[1];
        const $iACode = Str.char($sA, 0);
        const $iBCode = Str.char($sB, 0);
        if ($iCCode >= $iACode && $iCCode <= $iBCode) { $bInSet = true; }
    }

    if ($mInstr["negate"] === true) { return !$bInSet; }
    return $bInSet;
};

const $mRunRegex = function($aProg, $sStr, $bCi, $iGroupCount, $iStartSp) {
    JSOL.use($bCharMatches, $sToLower);
    const $iN = Str.len($sStr);
    let $iPc = 0;
    let $iSp = $iStartSp;
    let $aSaves = [];
    const $iSavesLen = ($iGroupCount + 1) * 2;
    for (let $i = 0; $i < $iSavesLen; $i = $i + 1) { Arr.push($aSaves, -1); }

    const $aStack = [];
    let $iStackPtr = 0;

    let $bRunning = true;
    let $bMatched = false;

    while ($bRunning === true) {
        const $mInstr = $aProg[$iPc];
        let $bOk = true;
        const $sOp = $mInstr["op"];

        if ($sOp === "CHAR") {
            if ($iSp < $iN) {
                const $sCh = Str.sub($sStr, $iSp, 1);
                const $sVal = $mInstr["value"];
                const $bMatch = $bCi === true ? ($sToLower($sCh) === $sToLower($sVal)) : ($sCh === $sVal);
                if ($bMatch === true) { $iSp = $iSp + 1; $iPc = $iPc + 1; } else { $bOk = false; }
            } else { $bOk = false; }
        } else if ($sOp === "ANY") {
            if ($iSp < $iN) { $iSp = $iSp + 1; $iPc = $iPc + 1; } else { $bOk = false; }
        } else if ($sOp === "CLASS") {
            if ($iSp < $iN) {
                const $sCh = Str.sub($sStr, $iSp, 1);
                if ($bCharMatches($mInstr, $sCh, $bCi) === true) { $iSp = $iSp + 1; $iPc = $iPc + 1; } else { $bOk = false; }
            } else { $bOk = false; }
        } else if ($sOp === "BOL") {
            if ($iSp === 0) { $iPc = $iPc + 1; } else { $bOk = false; }
        } else if ($sOp === "EOL") {
            if ($iSp === $iN) { $iPc = $iPc + 1; } else { $bOk = false; }
        } else if ($sOp === "JMP") {
            $iPc = $mInstr["to"];
        } else if ($sOp === "SPLIT") {
            const $aSavesCopy = [];
            for (let $i = 0; $i < $iSavesLen; $i = $i + 1) { Arr.push($aSavesCopy, $aSaves[$i]); }
            const $mFrame = Map.create("pc", $mInstr["y"], "sp", $iSp, "saves", $aSavesCopy);
            if ($iStackPtr < Arr.count($aStack)) { $aStack[$iStackPtr] = $mFrame; } else { Arr.push($aStack, $mFrame); }
            $iStackPtr = $iStackPtr + 1;
            
            $iPc = $mInstr["x"];
        } else if ($sOp === "SAVE") {
            $aSaves[$mInstr["slot"]] = $iSp;
            $iPc = $iPc + 1;
        } else if ($sOp === "MATCH") {
            $bMatched = true;
            $bRunning = false;
        } else {
            $bOk = false;
        }

        if ($bRunning === true && $bOk === false) {
            if ($iStackPtr === 0) { 
                $bRunning = false; 
            } else {
                $iStackPtr = $iStackPtr - 1;
                const $mF = $aStack[$iStackPtr];
                $iPc = $mF["pc"];
                $iSp = $mF["sp"];
                $aSaves = $mF["saves"];
            }
        }
    }

    return Map.create("matched", $bMatched, "saves", $aSaves);
};

const $mRegexMatch = function($sPatternStr, $sStr, $sFlags) {
    JSOL.use($mParsePattern, $aCompileRegex, $mRunRegex);
    let $bCi = false;
    let $bGlobal = false;
    if (Str.indexOf($sFlags, "i") !== -1) { $bCi = true; }
    if (Str.indexOf($sFlags, "g") !== -1) { $bGlobal = true; }

    const $mParsed = $mParsePattern($sPatternStr);
    const $aProg = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    const $iGroupCount = $mParsed["groupCount"];

    const $iN = Str.len($sStr);
    for (let $iStart = 0; $iStart <= $iN; $iStart = $iStart + 1) {
        const $mR = $mRunRegex($aProg, $sStr, $bCi, $iGroupCount, $iStart);
        if ($mR["matched"] === true) {
            let $aGroups = [];
            for (let $iG = 0; $iG <= $iGroupCount; $iG = $iG + 1) {
                const $iS = $mR["saves"][$iG * 2];
                const $iE = $mR["saves"][$iG * 2 + 1];
                if ($iS >= 0 && $iE >= 0) {
                    const $sSubG = Str.sub($sStr, $iS, $iE - $iS);
                    Arr.push($aGroups, $sSubG);
                } else {
                    Arr.push($aGroups, null);
                }
            }
            return Map.create("matched", true, "groups", $aGroups, "index", $iStart, "length", $mR["saves"][1] - $mR["saves"][0]);
        }
    }
    return Map.create("matched", false, "groups", [], "index", -1, "length", 0);
};

const $sRegexReplace = function($sPatternStr, $sReplacementStr, $sStr, $sFlags) {
    JSOL.use($mParsePattern, $aCompileRegex, $mRunRegex);
    let $bCi = false;
    let $bGlobal = false;
    if (Str.indexOf($sFlags, "i") !== -1) { $bCi = true; }
    if (Str.indexOf($sFlags, "g") !== -1) { $bGlobal = true; }

    const $mParsed = $mParsePattern($sPatternStr);
    const $aProg = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    const $iGroupCount = $mParsed["groupCount"];

    let $sResult = "";
    let $i = 0;
    const $iN = Str.len($sStr);

    while ($i <= $iN) {
        let $bMatchFound = false;
        let $mR = Map.create("matched", false, "saves", []);
        let $iMatchIndex = $i;
        
        for (let $iStart = $i; $iStart <= $iN; $iStart = $iStart + 1) {
            $mR = $mRunRegex($aProg, $sStr, $bCi, $iGroupCount, $iStart);
            if ($mR["matched"] === true) {
                $bMatchFound = true;
                $iMatchIndex = $iStart;
                break;
            }
        }

        if ($bMatchFound === true) {
            const $iMatchStart = $mR["saves"][0];
            const $iMatchEnd = $mR["saves"][1];

            const $sSubA = Str.sub($sStr, $i, $iMatchStart - $i);
            $sResult = $sResult + "" + $sSubA;

            let $sRepResult = "";
            const $iRepLen = Str.len($sReplacementStr);
            for (let $iK = 0; $iK < $iRepLen; $iK = $iK + 1) {
                const $sC = Str.sub($sReplacementStr, $iK, 1);
                if ($sC === "$" && $iK + 1 < $iRepLen) {
                    const $sNextC = Str.sub($sReplacementStr, $iK + 1, 1);
                    const $iCode = Str.char($sNextC, 0);
                    if ($iCode >= 48 && $iCode <= 57) { 
                        const $iGIdx = $iCode - 48;
                        if ($iGIdx <= $iGroupCount) {
                            const $iGs = $mR["saves"][$iGIdx * 2];
                            const $iGe = $mR["saves"][$iGIdx * 2 + 1];
                            if ($iGs >= 0 && $iGe >= 0) {
                                const $sSubB = Str.sub($sStr, $iGs, $iGe - $iGs);
                                $sRepResult = $sRepResult + "" + $sSubB;
                            }
                        }
                        $iK = $iK + 1;
                    } else {
                        $sRepResult = $sRepResult + "" + $sC;
                    }
                } else {
                    $sRepResult = $sRepResult + "" + $sC;
                }
            }

            $sResult = $sResult + "" + $sRepResult;
            
            if ($iMatchEnd === $iMatchIndex) {
                if ($iMatchIndex < $iN) {
                    const $sSubC = Str.sub($sStr, $iMatchIndex, 1);
                    $sResult = $sResult + "" + $sSubC;
                }
                $i = $iMatchIndex + 1;
            } else {
                $i = $iMatchEnd;
            }

            if ($bGlobal === false) {
                const $sSubD = Str.sub($sStr, $i, $iN - $i);
                $sResult = $sResult + "" + $sSubD;
                break;
            }
        } else {
            const $sSubE = Str.sub($sStr, $i, $iN - $i);
            $sResult = $sResult + "" + $sSubE;
            break;
        }
    }

    return $sResult;
};

const $bRegexTest = function($sPatternStr, $sStr, $sFlags) {
    JSOL.use($mRegexMatch);
    const $mR = $mRegexMatch($sPatternStr, $sStr, $sFlags);
    if (Map.has($mR, "matched") && $mR["matched"] === true) {
        return true;
    }
    return false;
};

const $mRgx = Map.create(
    "match", $mRegexMatch,
    "replace", $sRegexReplace,
    "test", $bRegexTest
);