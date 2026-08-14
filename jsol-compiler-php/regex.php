<?php
// @JSOL v0.2.93 - Pure JSOL Regex Engine (Thompson VM)

$mParseAtom = function($sPat, $i, $iN, $iGc, $mFns) {
    $sC = mb_substr($sPat,  $i,  1, "UTF-8");
    if ($sC === "(") {
        $i = $i + 1;
        $iGc = $iGc + 1;
        $iIdx = $iGc;
        $fPAltFn = $mFns["parseAlt"];
        $mR = $fPAltFn($sPat, $i, $iN, $iGc, $mFns);
        $mBody = $mR["node"];
        $i = $mR["i"];
        $iGc = $mR["groupCount"];
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "group", "index", $iIdx, "body", $mBody), "i", $i, "groupCount", $iGc);
    }
    if ($sC === "[") {
        $i = $i + 1;
        $bNegate = false;
        if ($i < $iN && mb_substr($sPat,  $i,  1, "UTF-8") === "^") {
            $bNegate = true;
            $i = $i + 1;
        }
        $aRanges = [];
        $aSingles = [];
        $bFirst = true;
        while ($i < $iN && (mb_substr($sPat,  $i,  1, "UTF-8") !== "]" || $bFirst)) {
            $bFirst = false;
            $sCh = mb_substr($sPat,  $i,  1, "UTF-8");
            $bIsShorthand = false;
            if ($sCh === "\\") {
                $i = $i + 1;
                $sE = mb_substr($sPat,  $i,  1, "UTF-8");
                if ($sE === "d") {
                    $aR09 = ["0", "9"]; $aRanges[] =  $aR09;
                    $bIsShorthand = true;
                    $i = $i + 1;
                } else if ($sE === "w") {
                    $aRaz = ["a", "z"]; $aRanges[] =  $aRaz;
                    $aRAZ = ["A", "Z"]; $aRanges[] =  $aRAZ;
                    $aR09w = ["0", "9"]; $aRanges[] =  $aR09w;
                    $aSingles[] =  "_";
                    $bIsShorthand = true;
                    $i = $i + 1;
                } else if ($sE === "s") {
                    $aSingles[] =  " "; $aSingles[] =  "\t"; $aSingles[] =  "\n"; $aSingles[] =  "\r";
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
            if ($i < $iN && mb_substr($sPat,  $i,  1, "UTF-8") === "-" && $i + 1 < $iN && mb_substr($sPat,  $i + 1,  1, "UTF-8") !== "]") {
                $i = $i + 1;
                $sCh2 = mb_substr($sPat,  $i,  1, "UTF-8");
                if ($sCh2 === "\\") {
                    $i = $i + 1;
                    $sCh2 = mb_substr($sPat,  $i,  1, "UTF-8");
                    $i = $i + 1;
                } else {
                    $i = $i + 1;
                }
                $aRng = [$sCh, $sCh2];
                $aRanges[] =  $aRng;
            } else {
                $aSingles[] =  $sCh;
            }
        }
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "class", "negate", $bNegate, "ranges", $aRanges, "singles", $aSingles), "i", $i, "groupCount", $iGc);
    }
    if ($sC === ".") {
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "any"), "i", $i, "groupCount", $iGc);
    }
    if ($sC === "^") {
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "anchorStart"), "i", $i, "groupCount", $iGc);
    }
    if ($sC === "$") {
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "anchorEnd"), "i", $i, "groupCount", $iGc);
    }
    if ($sC === "\\") {
        $i = $i + 1;
        $sE = mb_substr($sPat,  $i,  1, "UTF-8");
        $i = $i + 1;
        if ($sE === "d") { $aRd = [["0", "9"]]; return JSOL::dict("node", JSOL::dict("type", "class", "negate", false, "ranges", $aRd, "singles", []), "i", $i, "groupCount", $iGc); }
        if ($sE === "w") { $aRw = [["a", "z"], ["A", "Z"], ["0", "9"]]; $aSw = ["_"]; return JSOL::dict("node", JSOL::dict("type", "class", "negate", false, "ranges", $aRw, "singles", $aSw), "i", $i, "groupCount", $iGc); }
        if ($sE === "s") { $aSs = [" ", "\t", "\n", "\r"]; return JSOL::dict("node", JSOL::dict("type", "class", "negate", false, "ranges", [], "singles", $aSs), "i", $i, "groupCount", $iGc); }
        return JSOL::dict("node", JSOL::dict("type", "char", "value", $sE), "i", $i, "groupCount", $iGc);
    }
    $i = $i + 1;
    return JSOL::dict("node", JSOL::dict("type", "char", "value", $sC), "i", $i, "groupCount", $iGc);
};

$mParseQuantified = function($sPat, $i, $iN, $iGc, $mFns) {
    $fPaFn = $mFns["parseAtom"];
    $mR = $fPaFn($sPat, $i, $iN, $iGc, $mFns);
    $mAtom = $mR["node"];
    $i = $mR["i"];
    $iGc = $mR["groupCount"];

    while ($i < $iN) {
        $sC = mb_substr($sPat,  $i,  1, "UTF-8");
        if ($sC === "*") {
            $i = $i + 1;
            $bLazy = false;
            if ($i < $iN && mb_substr($sPat,  $i,  1, "UTF-8") === "?") { $bLazy = true; $i = $i + 1; }
            $mAtom = JSOL::dict("type", "rep", "min", 0, "max", 999999, "lazy", $bLazy, "body", $mAtom);
        } else if ($sC === "+") {
            $i = $i + 1;
            $bLazy = false;
            if ($i < $iN && mb_substr($sPat,  $i,  1, "UTF-8") === "?") { $bLazy = true; $i = $i + 1; }
            $mAtom = JSOL::dict("type", "rep", "min", 1, "max", 999999, "lazy", $bLazy, "body", $mAtom);
        } else if ($sC === "?") {
            $i = $i + 1;
            $bLazy = false;
            if ($i < $iN && mb_substr($sPat,  $i,  1, "UTF-8") === "?") { $bLazy = true; $i = $i + 1; }
            $mAtom = JSOL::dict("type", "rep", "min", 0, "max", 1, "lazy", $bLazy, "body", $mAtom);
        } else {
            break;
        }
    }
    return JSOL::dict("node", $mAtom, "i", $i, "groupCount", $iGc);
};

$mParseConcat = function($sPat, $i, $iN, $iGc, $mFns) {
    $aParts = [];
    $fPqFn = $mFns["parseQuantified"];
    while ($i < $iN && mb_substr($sPat,  $i,  1, "UTF-8") !== "|" && mb_substr($sPat,  $i,  1, "UTF-8") !== ")") {
        $mR = $fPqFn($sPat, $i, $iN, $iGc, $mFns);
        $aParts[] =  $mR["node"];
        $i = $mR["i"];
        $iGc = $mR["groupCount"];
    }
    return JSOL::dict("node", JSOL::dict("type", "concat", "parts", $aParts), "i", $i, "groupCount", $iGc);
};

$mParseAlt = function($sPat, $i, $iN, $iGc, $mFns) {
    $aOptions = [];
    $fPcFn = $mFns["parseConcat"];
    $mR1 = $fPcFn($sPat, $i, $iN, $iGc, $mFns);
    $aOptions[] =  $mR1["node"];
    $i = $mR1["i"];
    $iGc = $mR1["groupCount"];

    while ($i < $iN && mb_substr($sPat,  $i,  1, "UTF-8") === "|") {
        $i = $i + 1;
        $mR2 = $fPcFn($sPat, $i, $iN, $iGc, $mFns);
        $aOptions[] =  $mR2["node"];
        $i = $mR2["i"];
        $iGc = $mR2["groupCount"];
    }
    if (count($aOptions) === 1) { return JSOL::dict("node", $aOptions[0], "i", $i, "groupCount", $iGc); }
    return JSOL::dict("node", JSOL::dict("type", "alt", "options", $aOptions), "i", $i, "groupCount", $iGc);
};

$mParsePattern = function($sPat) use ($mParseAlt, $mParseConcat, $mParseQuantified, $mParseAtom) {

    $mFns = JSOL::dict(
        "parseAlt", $mParseAlt,
        "parseConcat", $mParseConcat,
        "parseQuantified", $mParseQuantified,
        "parseAtom", $mParseAtom
    );
    $iN = mb_strlen($sPat, "UTF-8");
    $mR = $mParseAlt($sPat, 0, $iN, 0, $mFns);
    return JSOL::dict("tree", $mR["node"], "groupCount", $mR["groupCount"]);
};

$fGen = function($mN, $aProg, $fSelfFn) {
    $sType = $mN["type"];
    if ($sType === "concat") {
        $aParts = $mN["parts"];
        $iPCount = count($aParts);
        for ($iP = 0; $iP < $iPCount; $iP = $iP + 1) { 
            $aProg = $fSelfFn($aParts[$iP], $aProg, $fSelfFn); 
        }
    } else if ($sType === "alt") {
        $aOptions = $mN["options"];
        $iOCount = count($aOptions);
        $aJmpEnds = [];
        for ($iIdx = 0; $iIdx < $iOCount; $iIdx = $iIdx + 1) {
            if ($iIdx < $iOCount - 1) {
                $iSplitPc = count($aProg);
                $aProg[] =  JSOL::dict("op", "SPLIT", "x", 0, "y", 0);
                $iX = count($aProg);
                $aProg = $fSelfFn($aOptions[$iIdx], $aProg, $fSelfFn);
                $iJmpPc = count($aProg);
                $aProg[] =  JSOL::dict("op", "JMP", "to", 0);
                $aJmpEnds[] =  $iJmpPc;
                $aProg[$iSplitPc]["x"] = $iX;
                $aProg[$iSplitPc]["y"] = count($aProg);
            } else {
                $aProg = $fSelfFn($aOptions[$iIdx], $aProg, $fSelfFn);
            }
        }
        $iJCount = count($aJmpEnds);
        for ($iJ = 0; $iJ < $iJCount; $iJ = $iJ + 1) {
            $aProg[$aJmpEnds[$iJ]]["to"] = count($aProg);
        }
    } else if ($sType === "rep") {
        $iMin = $mN["min"];
        $iMax = $mN["max"];
        $bLazy = $mN["lazy"];
        for ($iC = 0; $iC < $iMin; $iC = $iC + 1) { 
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn); 
        }
        if ($iMax === 999999) {
            $iSplitPc = count($aProg);
            $aProg[] =  JSOL::dict("op", "SPLIT", "x", 0, "y", 0);
            $iBodyStart = count($aProg);
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
            $aProg[] =  JSOL::dict("op", "JMP", "to", $iSplitPc);
            if ($bLazy === true) {
                $aProg[$iSplitPc]["x"] = count($aProg);
                $aProg[$iSplitPc]["y"] = $iBodyStart;
            } else {
                $aProg[$iSplitPc]["x"] = $iBodyStart;
                $aProg[$iSplitPc]["y"] = count($aProg);
            }
        } else {
            $iOptional = $iMax - $iMin;
            for ($iC = 0; $iC < $iOptional; $iC = $iC + 1) {
                $iSplitPc = count($aProg);
                $aProg[] =  JSOL::dict("op", "SPLIT", "x", 0, "y", 0);
                $iBodyStart = count($aProg);
                $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
                if ($bLazy === true) {
                    $aProg[$iSplitPc]["x"] = count($aProg);
                    $aProg[$iSplitPc]["y"] = $iBodyStart;
                } else {
                    $aProg[$iSplitPc]["x"] = $iBodyStart;
                    $aProg[$iSplitPc]["y"] = count($aProg);
                }
            }
        }
    } else if ($sType === "group") {
        $aProg[] =  JSOL::dict("op", "SAVE", "slot", $mN["index"] * 2);
        $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
        $aProg[] =  JSOL::dict("op", "SAVE", "slot", $mN["index"] * 2 + 1);
    } else if ($sType === "char") {
        $aProg[] =  JSOL::dict("op", "CHAR", "value", $mN["value"]);
    } else if ($sType === "any") {
        $aProg[] =  JSOL::dict("op", "ANY");
    } else if ($sType === "class") {
        $aProg[] =  JSOL::dict("op", "CLASS", "negate", $mN["negate"], "ranges", $mN["ranges"], "singles", $mN["singles"]);
    } else if ($sType === "anchorStart") {
        $aProg[] =  JSOL::dict("op", "BOL");
    } else if ($sType === "anchorEnd") {
        $aProg[] =  JSOL::dict("op", "EOL");
    }
    return $aProg;
};

$aCompileRegex = function($mNode, $iGroupCount) use ($fGen) {

    $aProg = [];
    $aProg[] =  JSOL::dict("op", "SAVE", "slot", 0);
    $aProg = $fGen($mNode, $aProg, $fGen);
    $aProg[] =  JSOL::dict("op", "SAVE", "slot", 1);
    $aProg[] =  JSOL::dict("op", "MATCH");
    return $aProg;
};

$sToLower = function($sCh) {
    $iCode = mb_ord(mb_substr($sCh,  0, 1, "UTF-8"));
    if ($iCode >= 65 && $iCode <= 90) { return mb_chr($iCode + 32, "UTF-8"); }
    return $sCh;
};

$bCharMatches = function($mInstr, $sCh, $bCi) use ($sToLower) {

    $bInSet = false;
    $sChComp = $bCi === true ? $sToLower($sCh) : $sCh;
    $iCCode = mb_ord(mb_substr($sChComp,  0, 1, "UTF-8"));

    $aSingles = $mInstr["singles"];
    $iSCount = count($aSingles);
    for ($i = 0; $i < $iSCount; $i = $i + 1) {
        $sS = $aSingles[$i];
        $sSComp = $bCi === true ? $sToLower($sS) : $sS;
        if ($sSComp === $sChComp) { $bInSet = true; }
    }

    $aRanges = $mInstr["ranges"];
    $iRCount = count($aRanges);
    for ($i = 0; $i < $iRCount; $i = $i + 1) {
        $aR = $aRanges[$i];
        $sA = $bCi === true ? $sToLower($aR[0]) : $aR[0];
        $sB = $bCi === true ? $sToLower($aR[1]) : $aR[1];
        $iACode = mb_ord(mb_substr($sA,  0, 1, "UTF-8"));
        $iBCode = mb_ord(mb_substr($sB,  0, 1, "UTF-8"));
        if ($iCCode >= $iACode && $iCCode <= $iBCode) { $bInSet = true; }
    }

    if ($mInstr["negate"] === true) { return !$bInSet; }
    return $bInSet;
};

$mRunRegex = function($aProg, $sStr, $bCi, $iGroupCount, $iStartSp) use ($bCharMatches, $sToLower) {

    $iN = mb_strlen($sStr, "UTF-8");
    $iPc = 0;
    $iSp = $iStartSp;
    $aSaves = [];
    $iSavesLen = ($iGroupCount + 1) * 2;
    for ($i = 0; $i < $iSavesLen; $i = $i + 1) { $aSaves[] =  -1; }

    $aStack = [];
    $iStackPtr = 0;

    $bRunning = true;
    $bMatched = false;

    while ($bRunning === true) {
        $mInstr = $aProg[$iPc];
        $bOk = true;
        $sOp = $mInstr["op"];

        if ($sOp === "CHAR") {
            if ($iSp < $iN) {
                $sCh = mb_substr($sStr,  $iSp,  1, "UTF-8");
                $sVal = $mInstr["value"];
                $bMatch = $bCi === true ? ($sToLower($sCh) === $sToLower($sVal)) : ($sCh === $sVal);
                if ($bMatch === true) { $iSp = $iSp + 1; $iPc = $iPc + 1; } else { $bOk = false; }
            } else { $bOk = false; }
        } else if ($sOp === "ANY") {
            if ($iSp < $iN) { $iSp = $iSp + 1; $iPc = $iPc + 1; } else { $bOk = false; }
        } else if ($sOp === "CLASS") {
            if ($iSp < $iN) {
                $sCh = mb_substr($sStr,  $iSp,  1, "UTF-8");
                if ($bCharMatches($mInstr, $sCh, $bCi) === true) { $iSp = $iSp + 1; $iPc = $iPc + 1; } else { $bOk = false; }
            } else { $bOk = false; }
        } else if ($sOp === "BOL") {
            if ($iSp === 0) { $iPc = $iPc + 1; } else { $bOk = false; }
        } else if ($sOp === "EOL") {
            if ($iSp === $iN) { $iPc = $iPc + 1; } else { $bOk = false; }
        } else if ($sOp === "JMP") {
            $iPc = $mInstr["to"];
        } else if ($sOp === "SPLIT") {
            $aSavesCopy = [];
            for ($i = 0; $i < $iSavesLen; $i = $i + 1) { $aSavesCopy[] =  $aSaves[$i]; }
            $mFrame = JSOL::dict("pc", $mInstr["y"], "sp", $iSp, "saves", $aSavesCopy);
            if ($iStackPtr < count($aStack)) { $aStack[$iStackPtr] = $mFrame; } else { $aStack[] =  $mFrame; }
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
                $mF = $aStack[$iStackPtr];
                $iPc = $mF["pc"];
                $iSp = $mF["sp"];
                $aSaves = $mF["saves"];
            }
        }
    }

    return JSOL::dict("matched", $bMatched, "saves", $aSaves);
};

$mRegexMatch = function($sPatternStr, $sStr, $sFlags) use ($mParsePattern, $aCompileRegex, $mRunRegex) {

    $bCi = false;
    $bGlobal = false;
    if (JSOL::strIndexOf($sFlags,  "i") !== -1) { $bCi = true; }
    if (JSOL::strIndexOf($sFlags,  "g") !== -1) { $bGlobal = true; }

    $mParsed = $mParsePattern($sPatternStr);
    $aProg = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    $iGroupCount = $mParsed["groupCount"];

    $iN = mb_strlen($sStr, "UTF-8");
    for ($iStart = 0; $iStart <= $iN; $iStart = $iStart + 1) {
        $mR = $mRunRegex($aProg, $sStr, $bCi, $iGroupCount, $iStart);
        if ($mR["matched"] === true) {
            $aGroups = [];
            for ($iG = 0; $iG <= $iGroupCount; $iG = $iG + 1) {
                $iS = $mR["saves"][$iG * 2];
                $iE = $mR["saves"][$iG * 2 + 1];
                if ($iS >= 0 && $iE >= 0) {
                    $sSubG = mb_substr($sStr,  $iS,  $iE - $iS, "UTF-8");
                    $aGroups[] =  $sSubG;
                } else {
                    $aGroups[] =  null;
                }
            }
            return JSOL::dict("matched", true, "groups", $aGroups, "index", $iStart, "length", $mR["saves"][1] - $mR["saves"][0]);
        }
    }
    return JSOL::dict("matched", false, "groups", [], "index", -1, "length", 0);
};

$sRegexReplace = function($sPatternStr, $sReplacementStr, $sStr, $sFlags) use ($mParsePattern, $aCompileRegex, $mRunRegex) {

    $bCi = false;
    $bGlobal = false;
    if (JSOL::strIndexOf($sFlags,  "i") !== -1) { $bCi = true; }
    if (JSOL::strIndexOf($sFlags,  "g") !== -1) { $bGlobal = true; }

    $mParsed = $mParsePattern($sPatternStr);
    $aProg = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    $iGroupCount = $mParsed["groupCount"];

    $sResult = "";
    $i = 0;
    $iN = mb_strlen($sStr, "UTF-8");

    while ($i <= $iN) {
        $bMatchFound = false;
        $mR = null;
        $iMatchIndex = $i;
        
        for ($iStart = $i; $iStart <= $iN; $iStart = $iStart + 1) {
            $mR = $mRunRegex($aProg, $sStr, $bCi, $iGroupCount, $iStart);
            if ($mR["matched"] === true) {
                $bMatchFound = true;
                $iMatchIndex = $iStart;
                break;
            }
        }

        if ($bMatchFound === true) {
            $iMatchStart = $mR["saves"][0];
            $iMatchEnd = $mR["saves"][1];

            $sSubA = mb_substr($sStr,  $i,  $iMatchStart - $i, "UTF-8");
            $sResult = $sResult . "" . $sSubA;

            $sRepResult = "";
            $iRepLen = mb_strlen($sReplacementStr, "UTF-8");
            for ($iK = 0; $iK < $iRepLen; $iK = $iK + 1) {
                $sC = mb_substr($sReplacementStr,  $iK,  1, "UTF-8");
                if ($sC === "$" && $iK + 1 < $iRepLen) {
                    $sNextC = mb_substr($sReplacementStr,  $iK + 1,  1, "UTF-8");
                    $iCode = mb_ord(mb_substr($sNextC,  0, 1, "UTF-8"));
                    if ($iCode >= 48 && $iCode <= 57) { 
                        $iGIdx = $iCode - 48;
                        if ($iGIdx <= $iGroupCount) {
                            $iGs = $mR["saves"][$iGIdx * 2];
                            $iGe = $mR["saves"][$iGIdx * 2 + 1];
                            if ($iGs >= 0 && $iGe >= 0) {
                                $sSubB = mb_substr($sStr,  $iGs,  $iGe - $iGs, "UTF-8");
                                $sRepResult = $sRepResult . "" . $sSubB;
                            }
                        }
                        $iK = $iK + 1;
                    } else {
                        $sRepResult = $sRepResult . "" . $sC;
                    }
                } else {
                    $sRepResult = $sRepResult . "" . $sC;
                }
            }

            $sResult = $sResult . "" . $sRepResult;
            
            if ($iMatchEnd === $iMatchIndex) {
                if ($iMatchIndex < $iN) {
                    $sSubC = mb_substr($sStr,  $iMatchIndex,  1, "UTF-8");
                    $sResult = $sResult . "" . $sSubC;
                }
                $i = $iMatchIndex + 1;
            } else {
                $i = $iMatchEnd;
            }

            if ($bGlobal === false) {
                $sSubD = mb_substr($sStr,  $i,  $iN - $i, "UTF-8");
                $sResult = $sResult . "" . $sSubD;
                break;
            }
        } else {
            $sSubE = mb_substr($sStr,  $i,  $iN - $i, "UTF-8");
            $sResult = $sResult . "" . $sSubE;
            break;
        }
    }

    return $sResult;
};

$mRegex = JSOL::dict(
    "match", $mRegexMatch,
    "replace", $sRegexReplace
);