declare var JSOL: any;
declare var Rgx: any;

// @JSOL v0.2.93 - Pure JSOL Regex Engine (Thompson VM)

const $mParseAtom = function($sPat: any, $i: any, $iN: any, $iGc: any, $mFns: any): Record<string, any> {
    const $sC: string = $sPat.substring( $i, ( $i) + ( 1));
    if ($sC === "(") {
        $i = $i + 1;
        let $bCapturing: boolean = true;
        if ($i + 1 < $iN && $sPat.substring( $i, ( $i) + ( 2)) === "?:") {
            $bCapturing = false;
            $i = $i + 2;
        }
        let $iIdx: number = -1;
        if ($bCapturing === true) {
            $iGc = $iGc + 1;
            $iIdx = $iGc;
        }
        const $fPAltFn = $mFns["parseAlt"];
        let $mR: Record<string, any> = $fPAltFn($sPat, $i, $iN, $iGc, $mFns);
        const $mBody: Record<string, any> = $mR["node"];
        $i = $mR["i"];
        $iGc = $mR["groupCount"];
        $i = $i + 1;
        return JSOL.dict("node",  JSOL.dict("type",  "group",  "index",  $iIdx,  "capturing",  $bCapturing,  "body",  $mBody),  "i",  $i,  "groupCount",  $iGc);
    }
    if ($sC === "[") {
        $i = $i + 1;
        let $bNegate: boolean = false;
        if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "^") {
            $bNegate = true;
            $i = $i + 1;
        }
        let $aRanges: any[] = [];
        let $aSingles: any[] = [];
        let $bFirst: boolean = true;
        while ($i < $iN && ($sPat.substring( $i, ( $i) + ( 1)) !== "]" || $bFirst)) {
            $bFirst = false;
            let $sCh: string = $sPat.substring( $i, ( $i) + ( 1));
            let $bIsShorthand: boolean = false;
            if ($sCh === "\\") {
                $i = $i + 1;
                const $sE: string = $sPat.substring( $i, ( $i) + ( 1));
                if ($sE === "d") {
                    const $aR09: any[] = ["0", "9"]; $aRanges.push( $aR09);
                    $bIsShorthand = true;
                    $i = $i + 1;
                } else if ($sE === "w") {
                    const $aRaz: any[] = ["a", "z"]; $aRanges.push( $aRaz);
                    const $aRAZ: any[] = ["A", "Z"]; $aRanges.push( $aRAZ);
                    const $aR09w: any[] = ["0", "9"]; $aRanges.push( $aR09w);
                    $aSingles.push( "_");
                    $bIsShorthand = true;
                    $i = $i + 1;
                } else if ($sE === "s") {
                    $aSingles.push( " "); $aSingles.push( "\t"); $aSingles.push( "\n"); $aSingles.push( "\r");
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
            if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "-" && $i + 1 < $iN && $sPat.substring( $i + 1, ( $i + 1) + ( 1)) !== "]") {
                $i = $i + 1;
                let $sCh2: string = $sPat.substring( $i, ( $i) + ( 1));
                if ($sCh2 === "\\") {
                    $i = $i + 1;
                    $sCh2 = $sPat.substring( $i, ( $i) + ( 1));
                    $i = $i + 1;
                } else {
                    $i = $i + 1;
                }
                const $aRng: any[] = [$sCh, $sCh2];
                $aRanges.push( $aRng);
            } else {
                $aSingles.push( $sCh);
            }
        }
        $i = $i + 1;
        return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  $bNegate,  "ranges",  $aRanges,  "singles",  $aSingles),  "i",  $i,  "groupCount",  $iGc);
    }
    if ($sC === ".") {
        $i = $i + 1;
        return JSOL.dict("node",  JSOL.dict("type",  "any"),  "i",  $i,  "groupCount",  $iGc);
    }
    if ($sC === "^") {
        $i = $i + 1;
        return JSOL.dict("node",  JSOL.dict("type",  "anchorStart"),  "i",  $i,  "groupCount",  $iGc);
    }
    if ($sC === "$") {
        $i = $i + 1;
        return JSOL.dict("node",  JSOL.dict("type",  "anchorEnd"),  "i",  $i,  "groupCount",  $iGc);
    }
    if ($sC === "\\") {
        $i = $i + 1;
        const $sE: string = $sPat.substring( $i, ( $i) + ( 1));
        $i = $i + 1;
        if ($sE === "d") { const $aRd: any[] = [["0", "9"]]; return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  false,  "ranges",  $aRd,  "singles",  []),  "i",  $i,  "groupCount",  $iGc); }
        if ($sE === "w") { const $aRw: any[] = [["a", "z"], ["A", "Z"], ["0", "9"]]; const $aSw: any[] = ["_"]; return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  false,  "ranges",  $aRw,  "singles",  $aSw),  "i",  $i,  "groupCount",  $iGc); }
        if ($sE === "s") { const $aSs: any[] = [" ", "\t", "\n", "\r"]; return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  false,  "ranges",  [],  "singles",  $aSs),  "i",  $i,  "groupCount",  $iGc); }
        return JSOL.dict("node",  JSOL.dict("type",  "char",  "value",  $sE),  "i",  $i,  "groupCount",  $iGc);
    }
    $i = $i + 1;
    return JSOL.dict("node",  JSOL.dict("type",  "char",  "value",  $sC),  "i",  $i,  "groupCount",  $iGc);
};

const $mParseQuantified = function($sPat: any, $i: any, $iN: any, $iGc: any, $mFns: any): Record<string, any> {
    const $fPaFn = $mFns["parseAtom"];
    let $mR: Record<string, any> = $fPaFn($sPat, $i, $iN, $iGc, $mFns);
    let $mAtom: Record<string, any> = $mR["node"];
    $i = $mR["i"];
    $iGc = $mR["groupCount"];

    while ($i < $iN) {
        const $sC: string = $sPat.substring( $i, ( $i) + ( 1));
        if ($sC === "*") {
            $i = $i + 1;
            let $bLazy: boolean = false;
            if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "?") { $bLazy = true; $i = $i + 1; }
            $mAtom = JSOL.dict("type",  "rep",  "min",  0,  "max",  999999,  "lazy",  $bLazy,  "body",  $mAtom);
        } else if ($sC === "+") {
            $i = $i + 1;
            let $bLazy: boolean = false;
            if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "?") { $bLazy = true; $i = $i + 1; }
            $mAtom = JSOL.dict("type",  "rep",  "min",  1,  "max",  999999,  "lazy",  $bLazy,  "body",  $mAtom);
        } else if ($sC === "?") {
            $i = $i + 1;
            let $bLazy: boolean = false;
            if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "?") { $bLazy = true; $i = $i + 1; }
            $mAtom = JSOL.dict("type",  "rep",  "min",  0,  "max",  1,  "lazy",  $bLazy,  "body",  $mAtom);
        } else {
            break;
        }
    }
    return JSOL.dict("node",  $mAtom,  "i",  $i,  "groupCount",  $iGc);
};

const $mParseConcat = function($sPat: any, $i: any, $iN: any, $iGc: any, $mFns: any): Record<string, any> {
    let $aParts: any[] = [];
    const $fPqFn = $mFns["parseQuantified"];
    while ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) !== "|" && $sPat.substring( $i, ( $i) + ( 1)) !== ")") {
        let $mR: Record<string, any> = $fPqFn($sPat, $i, $iN, $iGc, $mFns);
        $aParts.push( $mR["node"]);
        $i = $mR["i"];
        $iGc = $mR["groupCount"];
    }
    return JSOL.dict("node",  JSOL.dict("type",  "concat",  "parts",  $aParts),  "i",  $i,  "groupCount",  $iGc);
};

const $mParseAlt = function($sPat: any, $i: any, $iN: any, $iGc: any, $mFns: any): Record<string, any> {
    let $aOptions: any[] = [];
    const $fPcFn = $mFns["parseConcat"];
    let $mR1: Record<string, any> = $fPcFn($sPat, $i, $iN, $iGc, $mFns);
    $aOptions.push( $mR1["node"]);
    $i = $mR1["i"];
    $iGc = $mR1["groupCount"];

    while ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "|") {
        $i = $i + 1;
        let $mR2: Record<string, any> = $fPcFn($sPat, $i, $iN, $iGc, $mFns);
        $aOptions.push( $mR2["node"]);
        $i = $mR2["i"];
        $iGc = $mR2["groupCount"];
    }
    if ($aOptions.length === 1) { return JSOL.dict("node",  $aOptions[0],  "i",  $i,  "groupCount",  $iGc); }
    return JSOL.dict("node",  JSOL.dict("type",  "alt",  "options",  $aOptions),  "i",  $i,  "groupCount",  $iGc);
};

const $mParsePattern = function($sPat: any): Record<string, any> {
    
    const $mFns: Record<string, any> = JSOL.dict(
        "parseAlt",  $mParseAlt, 
        "parseConcat",  $mParseConcat, 
        "parseQuantified",  $mParseQuantified, 
        "parseAtom",  $mParseAtom
    );
    const $iN: number = $sPat.length;
    const $mR: Record<string, any> = $mParseAlt($sPat, 0, $iN, 0, $mFns);
    return JSOL.dict("tree",  $mR["node"],  "groupCount",  $mR["groupCount"]);
};

const $fGen = function($mN: any, $aProg: any, $fSelfFn: any) {
    const $sType: string = $mN["type"];
    if ($sType === "concat") {
        const $aParts: any[] = $mN["parts"];
        const $iPCount: number = $aParts.length;
        for (let $iP = 0; $iP < $iPCount; $iP = $iP + 1) { 
            $aProg = $fSelfFn($aParts[$iP], $aProg, $fSelfFn); 
        }
    } else if ($sType === "alt") {
        const $aOptions: any[] = $mN["options"];
        const $iOCount: number = $aOptions.length;
        let $aJmpEnds: any[] = [];
        for (let $iIdx = 0; $iIdx < $iOCount; $iIdx = $iIdx + 1) {
            if ($iIdx < $iOCount - 1) {
                const $iSplitPc: number = $aProg.length;
                $aProg.push( JSOL.dict("op",  "SPLIT",  "x",  0,  "y",  0));
                const $iX: number = $aProg.length;
                $aProg = $fSelfFn($aOptions[$iIdx], $aProg, $fSelfFn);
                const $iJmpPc: number = $aProg.length;
                $aProg.push( JSOL.dict("op",  "JMP",  "to",  0));
                $aJmpEnds.push( $iJmpPc);
                $aProg[$iSplitPc]["x"] = $iX;
                $aProg[$iSplitPc]["y"] = $aProg.length;
            } else {
                $aProg = $fSelfFn($aOptions[$iIdx], $aProg, $fSelfFn);
            }
        }
        const $iJCount: number = $aJmpEnds.length;
        for (let $iJ = 0; $iJ < $iJCount; $iJ = $iJ + 1) {
            $aProg[$aJmpEnds[$iJ]]["to"] = $aProg.length;
        }
    } else if ($sType === "rep") {
        const $iMin: number = $mN["min"];
        const $iMax: number = $mN["max"];
        const $bLazy: boolean = $mN["lazy"];
        for (let $iC = 0; $iC < $iMin; $iC = $iC + 1) { 
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn); 
        }
        if ($iMax === 999999) {
            const $iSplitPc: number = $aProg.length;
            $aProg.push( JSOL.dict("op",  "SPLIT",  "x",  0,  "y",  0));
            const $iBodyStart: number = $aProg.length;
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
            $aProg.push( JSOL.dict("op",  "JMP",  "to",  $iSplitPc));
            if ($bLazy === true) {
                $aProg[$iSplitPc]["x"] = $aProg.length;
                $aProg[$iSplitPc]["y"] = $iBodyStart;
            } else {
                $aProg[$iSplitPc]["x"] = $iBodyStart;
                $aProg[$iSplitPc]["y"] = $aProg.length;
            }
        } else {
            const $iOptional: number = $iMax - $iMin;
            for (let $iC = 0; $iC < $iOptional; $iC = $iC + 1) {
                const $iSplitPc: number = $aProg.length;
                $aProg.push( JSOL.dict("op",  "SPLIT",  "x",  0,  "y",  0));
                const $iBodyStart: number = $aProg.length;
                $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
                if ($bLazy === true) {
                    $aProg[$iSplitPc]["x"] = $aProg.length;
                    $aProg[$iSplitPc]["y"] = $iBodyStart;
                } else {
                    $aProg[$iSplitPc]["x"] = $iBodyStart;
                    $aProg[$iSplitPc]["y"] = $aProg.length;
                }
            }
        }
    } else if ($sType === "group") {
        if (Object.prototype.hasOwnProperty.call($mN,  "capturing") && $mN["capturing"] === false) {
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
        } else {
            $aProg.push( JSOL.dict("op",  "SAVE",  "slot",  $mN["index"] * 2));
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
            $aProg.push( JSOL.dict("op",  "SAVE",  "slot",  $mN["index"] * 2 + 1));
        }
    } else if ($sType === "char") {
        $aProg.push( JSOL.dict("op",  "CHAR",  "value",  $mN["value"]));
    } else if ($sType === "any") {
        $aProg.push( JSOL.dict("op",  "ANY"));
    } else if ($sType === "class") {
        $aProg.push( JSOL.dict("op",  "CLASS",  "negate",  $mN["negate"],  "ranges",  $mN["ranges"],  "singles",  $mN["singles"]));
    } else if ($sType === "anchorStart") {
        $aProg.push( JSOL.dict("op",  "BOL"));
    } else if ($sType === "anchorEnd") {
        $aProg.push( JSOL.dict("op",  "EOL"));
    }
    return $aProg;
};

const $aCompileRegex = function($mNode: any, $iGroupCount: any): any[] {
    
    let $aProg: any[] = [];
    $aProg.push( JSOL.dict("op",  "SAVE",  "slot",  0));
    $aProg = $fGen($mNode, $aProg, $fGen);
    $aProg.push( JSOL.dict("op",  "SAVE",  "slot",  1));
    $aProg.push( JSOL.dict("op",  "MATCH"));
    return $aProg;
};

const $sToLower = function($sCh: any): string {
    const $iCode: number = $sCh.charCodeAt( 0);
    if ($iCode >= 65 && $iCode <= 90) { return String.fromCharCode($iCode + 32); }
    return $sCh;
};

const $bCharMatches = function($mInstr: any, $sCh: any, $bCi: any): boolean {
    
    let $bInSet: boolean = false;
    const $sChComp: string = $bCi === true ? $sToLower($sCh) : $sCh;
    const $iCCode: number = $sChComp.charCodeAt( 0);

    const $aSingles: any[] = $mInstr["singles"];
    const $iSCount: number = $aSingles.length;
    for (let $i = 0; $i < $iSCount; $i = $i + 1) {
        const $sS: string = $aSingles[$i];
        const $sSComp: string = $bCi === true ? $sToLower($sS) : $sS;
        if ($sSComp === $sChComp) { $bInSet = true; }
    }

    const $aRanges: any[] = $mInstr["ranges"];
    const $iRCount: number = $aRanges.length;
    for (let $i = 0; $i < $iRCount; $i = $i + 1) {
        const $aR: any[] = $aRanges[$i];
        const $sA: string = $bCi === true ? $sToLower($aR[0]) : $aR[0];
        const $sB: string = $bCi === true ? $sToLower($aR[1]) : $aR[1];
        const $iACode: number = $sA.charCodeAt( 0);
        const $iBCode: number = $sB.charCodeAt( 0);
        if ($iCCode >= $iACode && $iCCode <= $iBCode) { $bInSet = true; }
    }

    if ($mInstr["negate"] === true) { return !$bInSet; }
    return $bInSet;
};

const $mRunRegex = function($aProg: any, $sStr: any, $bCi: any, $iGroupCount: any, $iStartSp: any): Record<string, any> {
    
    const $iN: number = $sStr.length;
    let $iPc: number = 0;
    let $iSp: number = $iStartSp;
    let $aSaves: any[] = [];
    const $iSavesLen: number = ($iGroupCount + 1) * 2;
    for (let $i = 0; $i < $iSavesLen; $i = $i + 1) { $aSaves.push( -1); }

    const $aStack: any[] = [];
    let $iStackPtr: number = 0;

    let $bRunning: boolean = true;
    let $bMatched: boolean = false;

    while ($bRunning === true) {
        const $mInstr: Record<string, any> = $aProg[$iPc];
        let $bOk: boolean = true;
        const $sOp: string = $mInstr["op"];

        if ($sOp === "CHAR") {
            if ($iSp < $iN) {
                const $sCh: string = $sStr.substring( $iSp, ( $iSp) + ( 1));
                const $sVal: string = $mInstr["value"];
                const $bMatch: boolean = $bCi === true ? ($sToLower($sCh) === $sToLower($sVal)) : ($sCh === $sVal);
                if ($bMatch === true) { $iSp = $iSp + 1; $iPc = $iPc + 1; } else { $bOk = false; }
            } else { $bOk = false; }
        } else if ($sOp === "ANY") {
            if ($iSp < $iN) { $iSp = $iSp + 1; $iPc = $iPc + 1; } else { $bOk = false; }
        } else if ($sOp === "CLASS") {
            if ($iSp < $iN) {
                const $sCh: string = $sStr.substring( $iSp, ( $iSp) + ( 1));
                if ($bCharMatches($mInstr, $sCh, $bCi) === true) { $iSp = $iSp + 1; $iPc = $iPc + 1; } else { $bOk = false; }
            } else { $bOk = false; }
        } else if ($sOp === "BOL") {
            if ($iSp === 0) { $iPc = $iPc + 1; } else { $bOk = false; }
        } else if ($sOp === "EOL") {
            if ($iSp === $iN) { $iPc = $iPc + 1; } else { $bOk = false; }
        } else if ($sOp === "JMP") {
            $iPc = $mInstr["to"];
        } else if ($sOp === "SPLIT") {
            const $aSavesCopy: any[] = [];
            for (let $i = 0; $i < $iSavesLen; $i = $i + 1) { $aSavesCopy.push( $aSaves[$i]); }
            const $mFrame: Record<string, any> = JSOL.dict("pc",  $mInstr["y"],  "sp",  $iSp,  "saves",  $aSavesCopy);
            if ($iStackPtr < $aStack.length) { $aStack[$iStackPtr] = $mFrame; } else { $aStack.push( $mFrame); }
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
                const $mF: Record<string, any> = $aStack[$iStackPtr];
                $iPc = $mF["pc"];
                $iSp = $mF["sp"];
                $aSaves = $mF["saves"];
            }
        }
    }

    return JSOL.dict("matched",  $bMatched,  "saves",  $aSaves);
};

const $mRegexMatch = function($sPatternStr: any, $sStr: any, $sFlags: any): Record<string, any> {
    
    let $bCi: boolean = false;
    let $bGlobal: boolean = false;
    if ($sFlags.indexOf( "i") !== -1) { $bCi = true; }
    if ($sFlags.indexOf( "g") !== -1) { $bGlobal = true; }

    const $mParsed: Record<string, any> = $mParsePattern($sPatternStr);
    const $aProg: any[] = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    const $iGroupCount: number = $mParsed["groupCount"];

    const $iN: number = $sStr.length;
    for (let $iStart = 0; $iStart <= $iN; $iStart = $iStart + 1) {
        const $mR: Record<string, any> = $mRunRegex($aProg, $sStr, $bCi, $iGroupCount, $iStart);
        if ($mR["matched"] === true) {
            let $aGroups: any[] = [];
            for (let $iG = 0; $iG <= $iGroupCount; $iG = $iG + 1) {
                const $iS: number = $mR["saves"][$iG * 2];
                const $iE: number = $mR["saves"][$iG * 2 + 1];
                if ($iS >= 0 && $iE >= 0) {
                    const $sSubG: string = $sStr.substring( $iS, ( $iS) + ( $iE - $iS));
                    $aGroups.push( $sSubG);
                } else {
                    $aGroups.push( null);
                }
            }
            return JSOL.dict("matched",  true,  "groups",  $aGroups,  "index",  $iStart,  "length",  $mR["saves"][1] - $mR["saves"][0]);
        }
    }
    return JSOL.dict("matched",  false,  "groups",  [],  "index",  -1,  "length",  0);
};

const $sRegexReplace = function($sPatternStr: any, $sReplacementStr: any, $sStr: any, $sFlags: any): string {
    
    let $bCi: boolean = false;
    let $bGlobal: boolean = false;
    if ($sFlags.indexOf( "i") !== -1) { $bCi = true; }
    if ($sFlags.indexOf( "g") !== -1) { $bGlobal = true; }

    const $mParsed: Record<string, any> = $mParsePattern($sPatternStr);
    const $aProg: any[] = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    const $iGroupCount: number = $mParsed["groupCount"];

    let $sResult: string = "";
    let $i: number = 0;
    const $iN: number = $sStr.length;

    while ($i <= $iN) {
        let $bMatchFound: boolean = false;
        let $mR: Record<string, any> = JSOL.dict("matched",  false,  "saves",  []);
        let $iMatchIndex: number = $i;
        
        for (let $iStart = $i; $iStart <= $iN; $iStart = $iStart + 1) {
            $mR = $mRunRegex($aProg, $sStr, $bCi, $iGroupCount, $iStart);
            if ($mR["matched"] === true) {
                $bMatchFound = true;
                $iMatchIndex = $iStart;
                break;
            }
        }

        if ($bMatchFound === true) {
            const $iMatchStart: number = $mR["saves"][0];
            const $iMatchEnd: number = $mR["saves"][1];

            const $sSubA: string = $sStr.substring( $i, ( $i) + ( $iMatchStart - $i));
            $sResult = $sResult + "" + $sSubA;

            let $sRepResult: string = "";
            const $iRepLen: number = $sReplacementStr.length;
            for (let $iK = 0; $iK < $iRepLen; $iK = $iK + 1) {
                const $sC: string = $sReplacementStr.substring( $iK, ( $iK) + ( 1));
                if ($sC === "$" && $iK + 1 < $iRepLen) {
                    const $sNextC: string = $sReplacementStr.substring( $iK + 1, ( $iK + 1) + ( 1));
                    const $iCode: number = $sNextC.charCodeAt( 0);
                    if ($iCode >= 48 && $iCode <= 57) { 
                        const $iGIdx: number = $iCode - 48;
                        if ($iGIdx <= $iGroupCount) {
                            const $iGs: number = $mR["saves"][$iGIdx * 2];
                            const $iGe: number = $mR["saves"][$iGIdx * 2 + 1];
                            if ($iGs >= 0 && $iGe >= 0) {
                                const $sSubB: string = $sStr.substring( $iGs, ( $iGs) + ( $iGe - $iGs));
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
                    const $sSubC: string = $sStr.substring( $iMatchIndex, ( $iMatchIndex) + ( 1));
                    $sResult = $sResult + "" + $sSubC;
                }
                $i = $iMatchIndex + 1;
            } else {
                $i = $iMatchEnd;
            }

            if ($bGlobal === false) {
                const $sSubD: string = $sStr.substring( $i, ( $i) + ( $iN - $i));
                $sResult = $sResult + "" + $sSubD;
                break;
            }
        } else {
            const $sSubE: string = $sStr.substring( $i, ( $i) + ( $iN - $i));
            $sResult = $sResult + "" + $sSubE;
            break;
        }
    }

    return $sResult;
};

const $bRegexTest = function($sPatternStr: any, $sStr: any, $sFlags: any): boolean {
    const $mR: Record<string, any> = $mRegexMatch($sPatternStr, $sStr, $sFlags);
    if (Object.prototype.hasOwnProperty.call($mR,  "matched") && $mR["matched"] === true) {
        return true;
    }
    return false;
};

const $mRgx: Record<string, any> = JSOL.dict(
    "match",  $mRegexMatch, 
    "replace",  $sRegexReplace, 
    "test",  $bRegexTest
);