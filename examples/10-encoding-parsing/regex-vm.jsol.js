// @JSOL v0.2.97

/**
 @description
 Thompson NFA Regular Expression Virtual Machine.
 Parses a subset of regular expressions (concatenation, alternation,
 Kleene star, optionals, and capture groups) into bytecode, and evaluates 
 strings against that automaton in O(N) time.
 
 Originally written to ensure the platform could boot from a JSOL self-hosted compiler. Once proven, the architecture safely migrated to native `Regex.*` engine delegation. This engine remains as a pure-JSOL reference implementation of a bytecode parser and VM.

 TODO: Implement missing features required for parity with the current native safe subset (e.g., {n,m} quantifiers, \b/\B boundaries). Additionally, restrict the . (dot) wildcard so it correctly excludes line terminators (\n, \r) by default, aligning with standard regex behavior. Achieving this parity is strictly required to eventually support Lua as a target, since Lua lacks native POSIX regex support and will rely on this VM at runtime.

@param {string} $saPatternStr - The regex pattern to compile and search.
@param {string} $saReplacementStr - The replacement string (supports capture group references like $1, $2).
@param {string} $saStr - The target text to operate on.
@param {string} $saFlags - Execution flags (e.g., "g" for global replacement).
@returns {string} - The resulting string after applying the replacements.
*/

/**
 @contract
 {
   "cases": [
     { "$saPatternStr": "([a-z]+)-([0-9]+)", "$saReplacementStr": "$2:$1", "$saStr": "id-42 and user-99", "$saFlags": "g" },
     { "$saPatternStr": "\\s+", "$saReplacementStr": "-", "$saStr": "hello   world", "$saFlags": "g" },
     { "$saPatternStr": "a(b|c)*d", "$saReplacementStr": "MATCH", "$saStr": "z abbbcd z", "$saFlags": "g" }
   ]
 }
*/

const $mParseAtom = function($saPat, $nIndex, $nN, $nGc, $mFns) {
    const $saC = Str.sub($saPat, $nIndex, 1);
    if ($saC === "(") {
        $nIndex = $nIndex + 1;
        let $bCapturing = true;
        if ($nIndex + 1 < $nN && Str.sub($saPat, $nIndex, 2) === "?:") {
            $bCapturing = false;
            $nIndex = $nIndex + 2;
        }
        let $nIdx = -1;
        if ($bCapturing === true) {
            $nGc = $nGc + 1;
            $nIdx = $nGc;
        }
        const $fPAltFn = $mFns["parseAlt"];
        let $mR = $fPAltFn($saPat, $nIndex, $nN, $nGc, $mFns);
        const $mBody = $mR["node"];
        $nIndex = $mR["i"];
        $nGc = $mR["groupCount"];
        $nIndex = $nIndex + 1;
        return Map.create("node", Map.create("type", "group", "index", $nIdx, "capturing", $bCapturing, "body", $mBody), "i", $nIndex, "groupCount", $nGc);
    }
    if ($saC === "[") {
        $nIndex = $nIndex + 1;
        let $bNegate = false;
        if ($nIndex < $nN && Str.sub($saPat, $nIndex, 1) === "^") {
            $bNegate = true;
            $nIndex = $nIndex + 1;
        }
        let $aRanges = [];
        let $aSingles = [];
        let $bFirst = true;
        while ($nIndex < $nN && (Str.sub($saPat, $nIndex, 1) !== "]" || $bFirst)) {
            $bFirst = false;
            let $saCh = Str.sub($saPat, $nIndex, 1);
            let $bIsShorthand = false;
            if ($saCh === "\\") {
                $nIndex = $nIndex + 1;
                const $saE = Str.sub($saPat, $nIndex, 1);
                if ($saE === "d") {
                    const $aR09 = ["0", "9"]; Arr.push($aRanges, $aR09);
                    $bIsShorthand = true;
                    $nIndex = $nIndex + 1;
                } else if ($saE === "w") {
                    const $aRaz = ["a", "z"]; Arr.push($aRanges, $aRaz);
                    const $aRAZ = ["A", "Z"]; Arr.push($aRanges, $aRAZ);
                    const $aR09w = ["0", "9"]; Arr.push($aRanges, $aR09w);
                    Arr.push($aSingles, "_");
                    $bIsShorthand = true;
                    $nIndex = $nIndex + 1;
                } else if ($saE === "s") {
                    Arr.push($aSingles, " "); Arr.push($aSingles, "\t"); Arr.push($aSingles, "\n"); Arr.push($aSingles, "\r");
                    $bIsShorthand = true;
                    $nIndex = $nIndex + 1;
                } else {
                    $saCh = $saE;
                    $nIndex = $nIndex + 1;
                }
            } else {
                $nIndex = $nIndex + 1;
            }
            if ($bIsShorthand === true) { continue; }
            if ($nIndex < $nN && Str.sub($saPat, $nIndex, 1) === "-" && $nIndex + 1 < $nN && Str.sub($saPat, $nIndex + 1, 1) !== "]") {
                $nIndex = $nIndex + 1;
                let $saCh2 = Str.sub($saPat, $nIndex, 1);
                if ($saCh2 === "\\") {
                    $nIndex = $nIndex + 1;
                    $saCh2 = Str.sub($saPat, $nIndex, 1);
                    $nIndex = $nIndex + 1;
                } else {
                    $nIndex = $nIndex + 1;
                }
                const $aRng = [$saCh, $saCh2];
                Arr.push($aRanges, $aRng);
            } else {
                Arr.push($aSingles, $saCh);
            }
        }
        $nIndex = $nIndex + 1;
        return Map.create("node", Map.create("type", "class", "negate", $bNegate, "ranges", $aRanges, "singles", $aSingles), "i", $nIndex, "groupCount", $nGc);
    }
    if ($saC === ".") {
        $nIndex = $nIndex + 1;
        return Map.create("node", Map.create("type", "any"), "i", $nIndex, "groupCount", $nGc);
    }
    if ($saC === "^") {
        $nIndex = $nIndex + 1;
        return Map.create("node", Map.create("type", "anchorStart"), "i", $nIndex, "groupCount", $nGc);
    }
    if ($saC === "$") {
        $nIndex = $nIndex + 1;
        return Map.create("node", Map.create("type", "anchorEnd"), "i", $nIndex, "groupCount", $nGc);
    }
    if ($saC === "\\") {
        $nIndex = $nIndex + 1;
        const $saE = Str.sub($saPat, $nIndex, 1);
        $nIndex = $nIndex + 1;
        if ($saE === "d") { const $aRd = [["0", "9"]]; return Map.create("node", Map.create("type", "class", "negate", false, "ranges", $aRd, "singles", []), "i", $nIndex, "groupCount", $nGc); }
        if ($saE === "w") { const $aRw = [["a", "z"], ["A", "Z"], ["0", "9"]]; const $aSw = ["_"]; return Map.create("node", Map.create("type", "class", "negate", false, "ranges", $aRw, "singles", $aSw), "i", $nIndex, "groupCount", $nGc); }
        if ($saE === "s") { const $aSs = [" ", "\t", "\n", "\r"]; return Map.create("node", Map.create("type", "class", "negate", false, "ranges", [], "singles", $aSs), "i", $nIndex, "groupCount", $nGc); }
        return Map.create("node", Map.create("type", "char", "value", $saE), "i", $nIndex, "groupCount", $nGc);
    }
    $nIndex = $nIndex + 1;
    return Map.create("node", Map.create("type", "char", "value", $saC), "i", $nIndex, "groupCount", $nGc);
};

const $mParseQuantified = function($saPat, $nIndex, $nN, $nGc, $mFns) {
    const $fPaFn = $mFns["parseAtom"];
    let $mR = $fPaFn($saPat, $nIndex, $nN, $nGc, $mFns);
    let $mAtom = $mR["node"];
    $nIndex = $mR["i"];
    $nGc = $mR["groupCount"];

    while ($nIndex < $nN) {
        const $saC = Str.sub($saPat, $nIndex, 1);
        if ($saC === "*") {
            $nIndex = $nIndex + 1;
            let $bLazy = false;
            if ($nIndex < $nN && Str.sub($saPat, $nIndex, 1) === "?") { $bLazy = true; $nIndex = $nIndex + 1; }
            $mAtom = Map.create("type", "rep", "min", 0, "max", 999999, "lazy", $bLazy, "body", $mAtom);
        } else if ($saC === "+") {
            $nIndex = $nIndex + 1;
            let $bLazy = false;
            if ($nIndex < $nN && Str.sub($saPat, $nIndex, 1) === "?") { $bLazy = true; $nIndex = $nIndex + 1; }
            $mAtom = Map.create("type", "rep", "min", 1, "max", 999999, "lazy", $bLazy, "body", $mAtom);
        } else if ($saC === "?") {
            $nIndex = $nIndex + 1;
            let $bLazy = false;
            if ($nIndex < $nN && Str.sub($saPat, $nIndex, 1) === "?") { $bLazy = true; $nIndex = $nIndex + 1; }
            $mAtom = Map.create("type", "rep", "min", 0, "max", 1, "lazy", $bLazy, "body", $mAtom);
        } else {
            break;
        }
    }
    return Map.create("node", $mAtom, "i", $nIndex, "groupCount", $nGc);
};

const $mParseConcat = function($saPat, $nIndex, $nN, $nGc, $mFns) {
    let $aParts = [];
    const $fPqFn = $mFns["parseQuantified"];
    while ($nIndex < $nN && Str.sub($saPat, $nIndex, 1) !== "|" && Str.sub($saPat, $nIndex, 1) !== ")") {
        let $mR = $fPqFn($saPat, $nIndex, $nN, $nGc, $mFns);
        Arr.push($aParts, $mR["node"]);
        $nIndex = $mR["i"];
        $nGc = $mR["groupCount"];
    }
    return Map.create("node", Map.create("type", "concat", "parts", $aParts), "i", $nIndex, "groupCount", $nGc);
};

const $mParseAlt = function($saPat, $nIndex, $nN, $nGc, $mFns) {
    let $aOptions = [];
    const $fPcFn = $mFns["parseConcat"];
    let $mR1 = $fPcFn($saPat, $nIndex, $nN, $nGc, $mFns);
    Arr.push($aOptions, $mR1["node"]);
    $nIndex = $mR1["i"];
    $nGc = $mR1["groupCount"];

    while ($nIndex < $nN && Str.sub($saPat, $nIndex, 1) === "|") {
        $nIndex = $nIndex + 1;
        let $mR2 = $fPcFn($saPat, $nIndex, $nN, $nGc, $mFns);
        Arr.push($aOptions, $mR2["node"]);
        $nIndex = $mR2["i"];
        $nGc = $mR2["groupCount"];
    }
    
    if (Arr.len($aOptions) === 1) { return Map.create("node", $aOptions[0], "i", $nIndex, "groupCount", $nGc); }
    return Map.create("node", Map.create("type", "alt", "options", $aOptions), "i", $nIndex, "groupCount", $nGc);
};

const $mParsePattern = function($saPat) {
    // JSOL 0.3.0 Note: Retained to reduce scope resolution ambiguity during compilation and polyfill interpretation.
    JSOL.use($mParseAlt, $mParseConcat, $mParseQuantified, $mParseAtom);
    const $mFns = Map.create(
        "parseAlt", $mParseAlt,
        "parseConcat", $mParseConcat,
        "parseQuantified", $mParseQuantified,
        "parseAtom", $mParseAtom
    );
    const $nN = Str.len($saPat);
    const $mR = $mParseAlt($saPat, 0, $nN, 0, $mFns);
    return Map.create("tree", $mR["node"], "groupCount", $mR["groupCount"]);
};

const $fGen = function($mNode, $aProg, $fSelfFn) {
    const $saType = $mNode["type"];
    if ($saType === "concat") {
        const $aParts = $mNode["parts"];
        const $nPCount = Arr.len($aParts);
        for (let $nP = 0; $nP < $nPCount; $nP = $nP + 1) { 
            $aProg = $fSelfFn($aParts[$nP], $aProg, $fSelfFn); 
        }
    } else if ($saType === "alt") {
        const $aOptions = $mNode["options"];
        const $nOCount = Arr.len($aOptions);
        let $aJmpEnds = [];
        for (let $nIdx = 0; $nIdx < $nOCount; $nIdx = $nIdx + 1) {
            if ($nIdx < $nOCount - 1) {
                const $nSplitPc = Arr.len($aProg);
                Arr.push($aProg, Map.create("op", "SPLIT", "x", 0, "y", 0));
                const $nX = Arr.len($aProg);
                $aProg = $fSelfFn($aOptions[$nIdx], $aProg, $fSelfFn);
                const $nJmpPc = Arr.len($aProg);
                Arr.push($aProg, Map.create("op", "JMP", "to", 0));
                Arr.push($aJmpEnds, $nJmpPc);
                $aProg[$nSplitPc]["x"] = $nX;
                $aProg[$nSplitPc]["y"] = Arr.len($aProg);
            } else {
                $aProg = $fSelfFn($aOptions[$nIdx], $aProg, $fSelfFn);
            }
        }
        const $nJCount = Arr.len($aJmpEnds);
        for (let $nJ = 0; $nJ < $nJCount; $nJ = $nJ + 1) {
            $aProg[$aJmpEnds[$nJ]]["to"] = Arr.len($aProg);
        }
    } else if ($saType === "rep") {
        const $nMin = $mNode["min"];
        const $nMax = $mNode["max"];
        const $bLazy = $mNode["lazy"];
        for (let $nC = 0; $nC < $nMin; $nC = $nC + 1) { 
            $aProg = $fSelfFn($mNode["body"], $aProg, $fSelfFn); 
        }
        if ($nMax === 999999) {
            const $nSplitPc = Arr.len($aProg);
            Arr.push($aProg, Map.create("op", "SPLIT", "x", 0, "y", 0));
            const $nBodyStart = Arr.len($aProg);
            $aProg = $fSelfFn($mNode["body"], $aProg, $fSelfFn);
            Arr.push($aProg, Map.create("op", "JMP", "to", $nSplitPc));
            if ($bLazy === true) {
                $aProg[$nSplitPc]["x"] = Arr.len($aProg);
                $aProg[$nSplitPc]["y"] = $nBodyStart;
            } else {
                $aProg[$nSplitPc]["x"] = $nBodyStart;
                $aProg[$nSplitPc]["y"] = Arr.len($aProg);
            }
        } else {
            const $nOptional = $nMax - $nMin;
            for (let $nC = 0; $nC < $nOptional; $nC = $nC + 1) {
                const $nSplitPc = Arr.len($aProg);
                Arr.push($aProg, Map.create("op", "SPLIT", "x", 0, "y", 0));
                const $nBodyStart = Arr.len($aProg);
                $aProg = $fSelfFn($mNode["body"], $aProg, $fSelfFn);
                if ($bLazy === true) {
                    $aProg[$nSplitPc]["x"] = Arr.len($aProg);
                    $aProg[$nSplitPc]["y"] = $nBodyStart;
                } else {
                    $aProg[$nSplitPc]["x"] = $nBodyStart;
                    $aProg[$nSplitPc]["y"] = Arr.len($aProg);
                }
            }
        }
    } else if ($saType === "group") {
        if (Map.has($mNode, "capturing") && $mNode["capturing"] === false) {
            $aProg = $fSelfFn($mNode["body"], $aProg, $fSelfFn);
        } else {
            Arr.push($aProg, Map.create("op", "SAVE", "slot", $mNode["index"] * 2));
            $aProg = $fSelfFn($mNode["body"], $aProg, $fSelfFn);
            Arr.push($aProg, Map.create("op", "SAVE", "slot", $mNode["index"] * 2 + 1));
        }
    } else if ($saType === "char") {
        Arr.push($aProg, Map.create("op", "CHAR", "value", $mNode["value"]));
    } else if ($saType === "any") {
        Arr.push($aProg, Map.create("op", "ANY"));
    } else if ($saType === "class") {
        Arr.push($aProg, Map.create("op", "CLASS", "negate", $mNode["negate"], "ranges", $mNode["ranges"], "singles", $mNode["singles"]));
    } else if ($saType === "anchorStart") {
        Arr.push($aProg, Map.create("op", "BOL"));
    } else if ($saType === "anchorEnd") {
        Arr.push($aProg, Map.create("op", "EOL"));
    }
    return $aProg;
};

const $aCompileRegex = function($mNode, $nGroupCount) {
    // JSOL 0.3.0 Note: Retained to reduce scope resolution ambiguity during compilation and polyfill interpretation.
    JSOL.use($fGen);
    let $aProg = [];
    Arr.push($aProg, Map.create("op", "SAVE", "slot", 0));
    $aProg = $fGen($mNode, $aProg, $fGen);
    Arr.push($aProg, Map.create("op", "SAVE", "slot", 1));
    Arr.push($aProg, Map.create("op", "MATCH"));
    return $aProg;
};

const $saToLower = function($saCh) {
    const $nCode = Str.char($saCh, 0);
    if ($nCode >= 65 && $nCode <= 90) { return Str.fromChar($nCode + 32); }
    return $saCh;
};

const $bCharMatches = function($mInstr, $saCh, $bCi) {
    // JSOL 0.3.0 Note: Retained to reduce scope resolution ambiguity during compilation and polyfill interpretation.
    JSOL.use($saToLower);
    let $bInSet = false;
    const $saChComp = $bCi === true ? $saToLower($saCh) : $saCh;
    const $nCCode = Str.char($saChComp, 0);

    const $aSingles = $mInstr["singles"];
    const $nSCount = Arr.len($aSingles);
    for (let $nIndex = 0; $nIndex < $nSCount; $nIndex = $nIndex + 1) {
        const $saS = $aSingles[$nIndex];
        const $saSComp = $bCi === true ? $saToLower($saS) : $saS;
        if ($saSComp === $saChComp) { $bInSet = true; }
    }

    const $aRanges = $mInstr["ranges"];
    const $nRCount = Arr.len($aRanges);
    for (let $nIndex = 0; $nIndex < $nRCount; $nIndex = $nIndex + 1) {
        const $aR = $aRanges[$nIndex];
        const $saA = $bCi === true ? $saToLower($aR[0]) : $aR[0];
        const $saB = $bCi === true ? $saToLower($aR[1]) : $aR[1];
        const $nACode = Str.char($saA, 0);
        const $nBCode = Str.char($saB, 0);
        if ($nCCode >= $nACode && $nCCode <= $nBCode) { $bInSet = true; }
    }

    if ($mInstr["negate"] === true) { return !$bInSet; }
    return $bInSet;
};

const $mRunRegex = function($aProg, $saStr, $bCi, $nGroupCount, $nStartSp) {
    // JSOL 0.3.0 Note: Retained to reduce scope resolution ambiguity during compilation and polyfill interpretation.
    JSOL.use($bCharMatches, $saToLower);
    const $nN = Str.len($saStr);
    let $nPc = 0;
    let $nSp = $nStartSp;
    let $aSaves = [];
    const $nSavesLen = ($nGroupCount + 1) * 2;
    for (let $nIndex = 0; $nIndex < $nSavesLen; $nIndex = $nIndex + 1) { Arr.push($aSaves, -1); }

    const $aStack = [];
    let $nStackPtr = 0;

    let $bRunning = true;
    let $bMatched = false;

    while ($bRunning === true) {
        const $mInstr = $aProg[$nPc];
        let $bOk = true;
        const $saOp = $mInstr["op"];

        if ($saOp === "CHAR") {
            if ($nSp < $nN) {
                const $saCh = Str.sub($saStr, $nSp, 1);
                const $saVal = $mInstr["value"];
                const $bMatch = $bCi === true ? ($saToLower($saCh) === $saToLower($saVal)) : ($saCh === $saVal);
                if ($bMatch === true) { $nSp = $nSp + 1; $nPc = $nPc + 1; } else { $bOk = false; }
            } else { $bOk = false; }
        } else if ($saOp === "ANY") {
            if ($nSp < $nN) { $nSp = $nSp + 1; $nPc = $nPc + 1; } else { $bOk = false; }
        } else if ($saOp === "CLASS") {
            if ($nSp < $nN) {
                const $saCh = Str.sub($saStr, $nSp, 1);
                if ($bCharMatches($mInstr, $saCh, $bCi) === true) { $nSp = $nSp + 1; $nPc = $nPc + 1; } else { $bOk = false; }
            } else { $bOk = false; }
        } else if ($saOp === "BOL") {
            if ($nSp === 0) { $nPc = $nPc + 1; } else { $bOk = false; }
        } else if ($saOp === "EOL") {
            if ($nSp === $nN) { $nPc = $nPc + 1; } else { $bOk = false; }
        } else if ($saOp === "JMP") {
            $nPc = $mInstr["to"];
        } else if ($saOp === "SPLIT") {
            const $aSavesCopy = [];
            for (let $nIndex = 0; $nIndex < $nSavesLen; $nIndex = $nIndex + 1) { Arr.push($aSavesCopy, $aSaves[$nIndex]); }
            const $mFrame = Map.create("pc", $mInstr["y"], "sp", $nSp, "saves", $aSavesCopy);
            if ($nStackPtr < Arr.len($aStack)) { $aStack[$nStackPtr] = $mFrame; } else { Arr.push($aStack, $mFrame); }
            $nStackPtr = $nStackPtr + 1;
            
            $nPc = $mInstr["x"];
        } else if ($saOp === "SAVE") {
            $aSaves[$mInstr["slot"]] = $nSp;
            $nPc = $nPc + 1;
        } else if ($saOp === "MATCH") {
            $bMatched = true;
            $bRunning = false;
        } else {
            $bOk = false;
        }

        if ($bRunning === true && $bOk === false) {
            if ($nStackPtr === 0) { 
                $bRunning = false; 
            } else {
                $nStackPtr = $nStackPtr - 1;
                const $mF = $aStack[$nStackPtr];
                $nPc = $mF["pc"];
                $nSp = $mF["sp"];
                $aSaves = $mF["saves"];
            }
        }
    }

    return Map.create("matched", $bMatched, "saves", $aSaves);
};

const $mRegexMatch = function($saPatternStr, $saStr, $saFlags) {
    // JSOL 0.3.0 Note: Retained to reduce scope resolution ambiguity during compilation and polyfill interpretation.
    JSOL.use($mParsePattern, $aCompileRegex, $mRunRegex);
    let $bCi = false;
    let $bGlobal = false;
    if (Str.indexOf($saFlags, "i") !== -1) { $bCi = true; }
    if (Str.indexOf($saFlags, "g") !== -1) { $bGlobal = true; }

    const $mParsed = $mParsePattern($saPatternStr);
    const $aProg = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    const $nGroupCount = $mParsed["groupCount"];

    const $nN = Str.len($saStr);
    for (let $nStart = 0; $nStart <= $nN; $nStart = $nStart + 1) {
        const $mR = $mRunRegex($aProg, $saStr, $bCi, $nGroupCount, $nStart);
        if ($mR["matched"] === true) {
            let $aGroups = [];
            for (let $nG = 0; $nG <= $nGroupCount; $nG = $nG + 1) {
                const $nS = $mR["saves"][$nG * 2];
                const $nE = $mR["saves"][$nG * 2 + 1];
                if ($nS >= 0 && $nE >= 0) {
                    const $saSubG = Str.sub($saStr, $nS, $nE - $nS);
                    Arr.push($aGroups, $saSubG);
                } else {
                    Arr.push($aGroups, null);
                }
            }
            return Map.create("matched", true, "groups", $aGroups, "index", $nStart, "length", $mR["saves"][1] - $mR["saves"][0]);
        }
    }
    return Map.create("matched", false, "groups", [], "index", -1, "length", 0);
};

const $saRegexReplace = function($saPatternStr, $saReplacementStr, $saStr, $saFlags) {
    // JSOL 0.3.0 Note: Retained to reduce scope resolution ambiguity during compilation and polyfill interpretation.
    JSOL.use($mParsePattern, $aCompileRegex, $mRunRegex);
    let $bCi = false;
    let $bGlobal = false;
    if (Str.indexOf($saFlags, "i") !== -1) { $bCi = true; }
    if (Str.indexOf($saFlags, "g") !== -1) { $bGlobal = true; }

    const $mParsed = $mParsePattern($saPatternStr);
    const $aProg = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    const $nGroupCount = $mParsed["groupCount"];

    let $saResult = "";
    let $nIndex = 0;
    const $nN = Str.len($saStr);

    while ($nIndex <= $nN) {
        let $bMatchFound = false;
        let $mR = Map.create("matched", false, "saves", []);
        let $nMatchIndex = $nIndex;
        
        for (let $nStart = $nIndex; $nStart <= $nN; $nStart = $nStart + 1) {
            $mR = $mRunRegex($aProg, $saStr, $bCi, $nGroupCount, $nStart);
            if ($mR["matched"] === true) {
                $bMatchFound = true;
                $nMatchIndex = $nStart;
                break;
            }
        }

        if ($bMatchFound === true) {
            const $nMatchStart = $mR["saves"][0];
            const $nMatchEnd = $mR["saves"][1];

            const $saSubA = Str.sub($saStr, $nIndex, $nMatchStart - $nIndex);
            $saResult = $saResult + "" + $saSubA;

            let $saRepResult = "";
            const $nRepLen = Str.len($saReplacementStr);
            for (let $nK = 0; $nK < $nRepLen; $nK = $nK + 1) {
                const $saC = Str.sub($saReplacementStr, $nK, 1);
                if ($saC === "$" && $nK + 1 < $nRepLen) {
                    const $saNextC = Str.sub($saReplacementStr, $nK + 1, 1);
                    const $nCode = Str.char($saNextC, 0);
                    if ($nCode >= 48 && $nCode <= 57) { 
                        const $nGIdx = $nCode - 48;
                        if ($nGIdx <= $nGroupCount) {
                            const $nGs = $mR["saves"][$nGIdx * 2];
                            const $nGe = $mR["saves"][$nGIdx * 2 + 1];
                            if ($nGs >= 0 && $nGe >= 0) {
                                const $saSubB = Str.sub($saStr, $nGs, $nGe - $nGs);
                                $saRepResult = $saRepResult + "" + $saSubB;
                            }
                        }
                        $nK = $nK + 1;
                    } else {
                        $saRepResult = $saRepResult + "" + $saC;
                    }
                } else {
                    $saRepResult = $saRepResult + "" + $saC;
                }
            }

            $saResult = $saResult + "" + $saRepResult;
            
            if ($nMatchEnd === $nMatchIndex) {
                if ($nMatchIndex < $nN) {
                    const $saSubC = Str.sub($saStr, $nMatchIndex, 1);
                    $saResult = $saResult + "" + $saSubC;
                }
                $nIndex = $nMatchIndex + 1;
            } else {
                $nIndex = $nMatchEnd;
            }

            if ($bGlobal === false) {
                const $saSubD = Str.sub($saStr, $nIndex, $nN - $nIndex);
                $saResult = $saResult + "" + $saSubD;
                break;
            }
        } else {
            const $saSubE = Str.sub($saStr, $nIndex, $nN - $nIndex);
            $saResult = $saResult + "" + $saSubE;
            break;
        }
    }

    return $saResult;
};

const $bRegexTest = function($saPatternStr, $saStr, $saFlags) {
    // JSOL 0.3.0 Note: Retained to reduce scope resolution ambiguity during compilation and polyfill interpretation.
    JSOL.use($mRegexMatch);
    const $mR = $mRegexMatch($saPatternStr, $saStr, $saFlags);
    if (Map.has($mR, "matched") && $mR["matched"] === true) {
        return true;
    }
    return false;
};

const $mRgx = Map.create(
    "match", $mRegexMatch,
    "replace", $saRegexReplace,
    "test", $bRegexTest
);