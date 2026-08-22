// @JSOL v0.2.93 - Pure JSOL Regex Engine (Thompson VM)

const $mParseAtom = function($sPat, $i, $iN, $iGc, $mFns) {
  const $sC = $sPat.substring( $i, ( $i) + ( 1));
    if ($sC === "(") {
    $i = $i + 1;
        let $bCapturing = true;
        if ($i + 1 < $iN && $sPat.substring( $i, ( $i) + ( 2)) === "?:") {
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
        return JSOL.dict("node",  JSOL.dict("type",  "group",  "index",  $iIdx,  "capturing",  $bCapturing,  "body",  $mBody),  "i",  $i,  "groupCount",  $iGc);
  }
  if ($sC === "[") {
    $i = $i + 1;
        let $bNegate = false;
        if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "^") {
      $bNegate = true;
            $i = $i + 1;
    }
    let $aRanges = [];
        let $aSingles = [];
        let $bFirst = true;
        while ($i < $iN && ($sPat.substring( $i, ( $i) + ( 1)) !== "]" || $bFirst)) {
      $bFirst = false;
            let $sCh = $sPat.substring( $i, ( $i) + ( 1));
            let $bIsShorthand = false;
            if ($sCh === "\\") {
        $i = $i + 1;
                const $sE = $sPat.substring( $i, ( $i) + ( 1));
                if ($sE === "d") {
          const $aR09 = ["0", "9"]; $aRanges.push( $aR09);
                    $bIsShorthand = true;
                    $i = $i + 1;
        }
        else if ($sE === "w") {
          const $aRaz = ["a", "z"]; $aRanges.push( $aRaz);
                    const $aRAZ = ["A", "Z"]; $aRanges.push( $aRAZ);
                    const $aR09w = ["0", "9"]; $aRanges.push( $aR09w);
                    $aSingles.push( "_");
                    $bIsShorthand = true;
                    $i = $i + 1;
        }
        else if ($sE === "s") {
          $aSingles.push( " "); $aSingles.push( "\t"); $aSingles.push( "\n"); $aSingles.push( "\r");
                    $bIsShorthand = true;
                    $i = $i + 1;
        }
        else {
          $sCh = $sE;
                    $i = $i + 1;
        }
      }
      else {
        $i = $i + 1;
      }
      if ($bIsShorthand === true) {
        continue;
      }
      if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "-" && $i + 1 < $iN && $sPat.substring( $i + 1, ( $i + 1) + ( 1)) !== "]") {
        $i = $i + 1;
                let $sCh2 = $sPat.substring( $i, ( $i) + ( 1));
                if ($sCh2 === "\\") {
          $i = $i + 1;
                    $sCh2 = $sPat.substring( $i, ( $i) + ( 1));
                    $i = $i + 1;
        }
        else {
          $i = $i + 1;
        }
        const $aRng = [$sCh, $sCh2];
                $aRanges.push( $aRng);
      }
      else {
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
        const $sE = $sPat.substring( $i, ( $i) + ( 1));
        $i = $i + 1;
        if ($sE === "d") {
      const $aRd = [["0", "9"]]; return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  false,  "ranges",  $aRd,  "singles",  []),  "i",  $i,  "groupCount",  $iGc);
    }
    if ($sE === "w") {
      const $aRw = [["a", "z"], ["A", "Z"], ["0", "9"]]; const $aSw = ["_"]; return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  false,  "ranges",  $aRw,  "singles",  $aSw),  "i",  $i,  "groupCount",  $iGc);
    }
    if ($sE === "s") {
      const $aSs = [" ", "\t", "\n", "\r"]; return JSOL.dict("node",  JSOL.dict("type",  "class",  "negate",  false,  "ranges",  [],  "singles",  $aSs),  "i",  $i,  "groupCount",  $iGc);
    }
    return JSOL.dict("node",  JSOL.dict("type",  "char",  "value",  $sE),  "i",  $i,  "groupCount",  $iGc);
  }
  $i = $i + 1;
    return JSOL.dict("node",  JSOL.dict("type",  "char",  "value",  $sC),  "i",  $i,  "groupCount",  $iGc);
};
const $mParseQuantified = function($sPat, $i, $iN, $iGc, $mFns) {
  const $fPaFn = $mFns["parseAtom"];
    let $mR = $fPaFn($sPat, $i, $iN, $iGc, $mFns);
    let $mAtom = $mR["node"];
    $i = $mR["i"];
    $iGc = $mR["groupCount"];

    while ($i < $iN) {
    const $sC = $sPat.substring( $i, ( $i) + ( 1));
        if ($sC === "*") {
      $i = $i + 1;
            let $bLazy = false;
            if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "?") {
        $bLazy = true; $i = $i + 1;
      }
      $mAtom = JSOL.dict("type",  "rep",  "min",  0,  "max",  999999,  "lazy",  $bLazy,  "body",  $mAtom);
    }
    else if ($sC === "+") {
      $i = $i + 1;
            let $bLazy = false;
            if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "?") {
        $bLazy = true; $i = $i + 1;
      }
      $mAtom = JSOL.dict("type",  "rep",  "min",  1,  "max",  999999,  "lazy",  $bLazy,  "body",  $mAtom);
    }
    else if ($sC === "?") {
      $i = $i + 1;
            let $bLazy = false;
            if ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "?") {
        $bLazy = true; $i = $i + 1;
      }
      $mAtom = JSOL.dict("type",  "rep",  "min",  0,  "max",  1,  "lazy",  $bLazy,  "body",  $mAtom);
    }
    else {
      break;
    }
  }
  return JSOL.dict("node",  $mAtom,  "i",  $i,  "groupCount",  $iGc);
};
const $mParseConcat = function($sPat, $i, $iN, $iGc, $mFns) {
  let $aParts = [];
    const $fPqFn = $mFns["parseQuantified"];
    while ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) !== "|" && $sPat.substring( $i, ( $i) + ( 1)) !== ")") {
    let $mR = $fPqFn($sPat, $i, $iN, $iGc, $mFns);
        $aParts.push( $mR["node"]);
        $i = $mR["i"];
        $iGc = $mR["groupCount"];
  }
  return JSOL.dict("node",  JSOL.dict("type",  "concat",  "parts",  $aParts),  "i",  $i,  "groupCount",  $iGc);
};
const $mParseAlt = function($sPat, $i, $iN, $iGc, $mFns) {
  let $aOptions = [];
    const $fPcFn = $mFns["parseConcat"];
    let $mR1 = $fPcFn($sPat, $i, $iN, $iGc, $mFns);
    $aOptions.push( $mR1["node"]);
    $i = $mR1["i"];
    $iGc = $mR1["groupCount"];

    while ($i < $iN && $sPat.substring( $i, ( $i) + ( 1)) === "|") {
    $i = $i + 1;
        let $mR2 = $fPcFn($sPat, $i, $iN, $iGc, $mFns);
        $aOptions.push( $mR2["node"]);
        $i = $mR2["i"];
        $iGc = $mR2["groupCount"];
  }
  if ($aOptions.length === 1) {
    return JSOL.dict("node",  $aOptions[0],  "i",  $i,  "groupCount",  $iGc);
  }
  return JSOL.dict("node",  JSOL.dict("type",  "alt",  "options",  $aOptions),  "i",  $i,  "groupCount",  $iGc);
};
const $mParsePattern = function($sPat) {
  const $mFns = JSOL.dict(
        "parseAlt",  $mParseAlt, 
        "parseConcat",  $mParseConcat, 
        "parseQuantified",  $mParseQuantified, 
        "parseAtom",  $mParseAtom
    );
    const $iN = $sPat.length;
    const $mR = $mParseAlt($sPat, 0, $iN, 0, $mFns);
    return JSOL.dict("tree",  $mR["node"],  "groupCount",  $mR["groupCount"]);
};
const $fGen = function($mN, $aProg, $fSelfFn) {
  const $sType = $mN["type"];
    if ($sType === "concat") {
    const $aParts = $mN["parts"];
        const $iPCount = $aParts.length;
        for (let $iP = 0; $iP < $iPCount; $iP = $iP + 1) {
      $aProg = $fSelfFn($aParts[$iP], $aProg, $fSelfFn);
    }
  }
  else if ($sType === "alt") {
    const $aOptions = $mN["options"];
        const $iOCount = $aOptions.length;
        let $aJmpEnds = [];
        for (let $iIdx = 0; $iIdx < $iOCount; $iIdx = $iIdx + 1) {
      if ($iIdx < $iOCount - 1) {
        const $iSplitPc = $aProg.length;
                $aProg.push( JSOL.dict("op",  "SPLIT",  "x",  0,  "y",  0));
                const $iX = $aProg.length;
                $aProg = $fSelfFn($aOptions[$iIdx], $aProg, $fSelfFn);
                const $iJmpPc = $aProg.length;
                $aProg.push( JSOL.dict("op",  "JMP",  "to",  0));
                $aJmpEnds.push( $iJmpPc);
                $aProg[$iSplitPc]["x"] = $iX;
                $aProg[$iSplitPc]["y"] = $aProg.length;
      }
      else {
        $aProg = $fSelfFn($aOptions[$iIdx], $aProg, $fSelfFn);
      }
    }
    const $iJCount = $aJmpEnds.length;
        for (let $iJ = 0; $iJ < $iJCount; $iJ = $iJ + 1) {
      $aProg[$aJmpEnds[$iJ]]["to"] = $aProg.length;
    }
  }
  else if ($sType === "rep") {
    const $iMin = $mN["min"];
        const $iMax = $mN["max"];
        const $bLazy = $mN["lazy"];
        for (let $iC = 0; $iC < $iMin; $iC = $iC + 1) {
      $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
    }
    if ($iMax === 999999) {
      const $iSplitPc = $aProg.length;
            $aProg.push( JSOL.dict("op",  "SPLIT",  "x",  0,  "y",  0));
            const $iBodyStart = $aProg.length;
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
            $aProg.push( JSOL.dict("op",  "JMP",  "to",  $iSplitPc));
            if ($bLazy === true) {
        $aProg[$iSplitPc]["x"] = $aProg.length;
                $aProg[$iSplitPc]["y"] = $iBodyStart;
      }
      else {
        $aProg[$iSplitPc]["x"] = $iBodyStart;
                $aProg[$iSplitPc]["y"] = $aProg.length;
      }
    }
    else {
      const $iOptional = $iMax - $iMin;
            for (let $iC = 0; $iC < $iOptional; $iC = $iC + 1) {
        const $iSplitPc = $aProg.length;
                $aProg.push( JSOL.dict("op",  "SPLIT",  "x",  0,  "y",  0));
                const $iBodyStart = $aProg.length;
                $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
                if ($bLazy === true) {
          $aProg[$iSplitPc]["x"] = $aProg.length;
                    $aProg[$iSplitPc]["y"] = $iBodyStart;
        }
        else {
          $aProg[$iSplitPc]["x"] = $iBodyStart;
                    $aProg[$iSplitPc]["y"] = $aProg.length;
        }
      }
    }
  }
  else if ($sType === "group") {
    if (Object.prototype.hasOwnProperty.call($mN,  "capturing") && $mN["capturing"] === false) {
      $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
    }
    else {
      $aProg.push( JSOL.dict("op",  "SAVE",  "slot",  $mN["index"] * 2));
            $aProg = $fSelfFn($mN["body"], $aProg, $fSelfFn);
            $aProg.push( JSOL.dict("op",  "SAVE",  "slot",  $mN["index"] * 2 + 1));
    }
  }
  else if ($sType === "char") {
    $aProg.push( JSOL.dict("op",  "CHAR",  "value",  $mN["value"]));
  }
  else if ($sType === "any") {
    $aProg.push( JSOL.dict("op",  "ANY"));
  }
  else if ($sType === "class") {
    $aProg.push( JSOL.dict("op",  "CLASS",  "negate",  $mN["negate"],  "ranges",  $mN["ranges"],  "singles",  $mN["singles"]));
  }
  else if ($sType === "anchorStart") {
    $aProg.push( JSOL.dict("op",  "BOL"));
  }
  else if ($sType === "anchorEnd") {
    $aProg.push( JSOL.dict("op",  "EOL"));
  }
  return $aProg;
};
const $aCompileRegex = function($mNode, $iGroupCount) {
  let $aProg = [];
    $aProg.push( JSOL.dict("op",  "SAVE",  "slot",  0));
    $aProg = $fGen($mNode, $aProg, $fGen);
    $aProg.push( JSOL.dict("op",  "SAVE",  "slot",  1));
    $aProg.push( JSOL.dict("op",  "MATCH"));
    return $aProg;
};
const $sToLower = function($sCh) {
  const $iCode = $sCh.charCodeAt( 0);
    if ($iCode >= 65 && $iCode <= 90) {
    return String.fromCharCode($iCode + 32);
  }
  return $sCh;
};
const $bCharMatches = function($mInstr, $sCh, $bCi) {
  let $bInSet = false;
    const $sChComp = $bCi === true ? $sToLower($sCh) : $sCh;
    const $iCCode = $sChComp.charCodeAt( 0);

    const $aSingles = $mInstr["singles"];
    const $iSCount = $aSingles.length;
    for (let $i = 0; $i < $iSCount; $i = $i + 1) {
    const $sS = $aSingles[$i];
        const $sSComp = $bCi === true ? $sToLower($sS) : $sS;
        if ($sSComp === $sChComp) {
      $bInSet = true;
    }
  }
  const $aRanges = $mInstr["ranges"];
    const $iRCount = $aRanges.length;
    for (let $i = 0; $i < $iRCount; $i = $i + 1) {
    const $aR = $aRanges[$i];
        const $sA = $bCi === true ? $sToLower($aR[0]) : $aR[0];
        const $sB = $bCi === true ? $sToLower($aR[1]) : $aR[1];
        const $iACode = $sA.charCodeAt( 0);
        const $iBCode = $sB.charCodeAt( 0);
        if ($iCCode >= $iACode && $iCCode <= $iBCode) {
      $bInSet = true;
    }
  }
  if ($mInstr["negate"] === true) {
    return !$bInSet;
  }
  return $bInSet;
};
const $mRunRegex = function($aProg, $sStr, $bCi, $iGroupCount, $iStartSp) {
  const $iN = $sStr.length;
    let $iPc = 0;
    let $iSp = $iStartSp;
    let $aSaves = [];
    const $iSavesLen = ($iGroupCount + 1) * 2;
    for (let $i = 0; $i < $iSavesLen; $i = $i + 1) {
    $aSaves.push( -1);
  }
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
        const $sCh = $sStr.substring( $iSp, ( $iSp) + ( 1));
                const $sVal = $mInstr["value"];
                const $bMatch = $bCi === true ? ($sToLower($sCh) === $sToLower($sVal)) : ($sCh === $sVal);
                if ($bMatch === true) {
          $iSp = $iSp + 1; $iPc = $iPc + 1;
        }
        else {
          $bOk = false;
        }
      }
      else {
        $bOk = false;
      }
    }
    else if ($sOp === "ANY") {
      if ($iSp < $iN) {
        $iSp = $iSp + 1; $iPc = $iPc + 1;
      }
      else {
        $bOk = false;
      }
    }
    else if ($sOp === "CLASS") {
      if ($iSp < $iN) {
        const $sCh = $sStr.substring( $iSp, ( $iSp) + ( 1));
                if ($bCharMatches($mInstr, $sCh, $bCi) === true) {
          $iSp = $iSp + 1; $iPc = $iPc + 1;
        }
        else {
          $bOk = false;
        }
      }
      else {
        $bOk = false;
      }
    }
    else if ($sOp === "BOL") {
      if ($iSp === 0) {
        $iPc = $iPc + 1;
      }
      else {
        $bOk = false;
      }
    }
    else if ($sOp === "EOL") {
      if ($iSp === $iN) {
        $iPc = $iPc + 1;
      }
      else {
        $bOk = false;
      }
    }
    else if ($sOp === "JMP") {
      $iPc = $mInstr["to"];
    }
    else if ($sOp === "SPLIT") {
      const $aSavesCopy = [];
            for (let $i = 0; $i < $iSavesLen; $i = $i + 1) {
        $aSavesCopy.push( $aSaves[$i]);
      }
      const $mFrame = JSOL.dict("pc",  $mInstr["y"],  "sp",  $iSp,  "saves",  $aSavesCopy);
            if ($iStackPtr < $aStack.length) {
        $aStack[$iStackPtr] = $mFrame;
      }
      else {
        $aStack.push( $mFrame);
      }
      $iStackPtr = $iStackPtr + 1;
            
            $iPc = $mInstr["x"];
    }
    else if ($sOp === "SAVE") {
      $aSaves[$mInstr["slot"]] = $iSp;
            $iPc = $iPc + 1;
    }
    else if ($sOp === "MATCH") {
      $bMatched = true;
            $bRunning = false;
    }
    else {
      $bOk = false;
    }
    if ($bRunning === true && $bOk === false) {
      if ($iStackPtr === 0) {
        $bRunning = false;
      }
      else {
        $iStackPtr = $iStackPtr - 1;
                const $mF = $aStack[$iStackPtr];
                $iPc = $mF["pc"];
                $iSp = $mF["sp"];
                $aSaves = $mF["saves"];
      }
    }
  }
  return JSOL.dict("matched",  $bMatched,  "saves",  $aSaves);
};
const $mRegexMatch = function($sPatternStr, $sStr, $sFlags) {
  let $bCi = false;
    let $bGlobal = false;
    if ($sFlags.indexOf( "i") !== -1) {
    $bCi = true;
  }
  if ($sFlags.indexOf( "g") !== -1) {
    $bGlobal = true;
  }
  const $mParsed = $mParsePattern($sPatternStr);
    const $aProg = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    const $iGroupCount = $mParsed["groupCount"];

    const $iN = $sStr.length;
    for (let $iStart = 0; $iStart <= $iN; $iStart = $iStart + 1) {
    const $mR = $mRunRegex($aProg, $sStr, $bCi, $iGroupCount, $iStart);
        if ($mR["matched"] === true) {
      let $aGroups = [];
            for (let $iG = 0; $iG <= $iGroupCount; $iG = $iG + 1) {
        const $iS = $mR["saves"][$iG * 2];
                const $iE = $mR["saves"][$iG * 2 + 1];
                if ($iS >= 0 && $iE >= 0) {
          const $sSubG = $sStr.substring( $iS, ( $iS) + ( $iE - $iS));
                    $aGroups.push( $sSubG);
        }
        else {
          $aGroups.push( null);
        }
      }
      return JSOL.dict("matched",  true,  "groups",  $aGroups,  "index",  $iStart,  "length",  $mR["saves"][1] - $mR["saves"][0]);
    }
  }
  return JSOL.dict("matched",  false,  "groups",  [],  "index",  -1,  "length",  0);
};
const $sRegexReplace = function($sPatternStr, $sReplacementStr, $sStr, $sFlags) {
  let $bCi = false;
    let $bGlobal = false;
    if ($sFlags.indexOf( "i") !== -1) {
    $bCi = true;
  }
  if ($sFlags.indexOf( "g") !== -1) {
    $bGlobal = true;
  }
  const $mParsed = $mParsePattern($sPatternStr);
    const $aProg = $aCompileRegex($mParsed["tree"], $mParsed["groupCount"]);
    const $iGroupCount = $mParsed["groupCount"];

    let $sResult = "";
    let $i = 0;
    const $iN = $sStr.length;

    while ($i <= $iN) {
    let $bMatchFound = false;
        let $mR = JSOL.dict("matched",  false,  "saves",  []);
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

            const $sSubA = $sStr.substring( $i, ( $i) + ( $iMatchStart - $i));
            $sResult = $sResult + "" + $sSubA;

            let $sRepResult = "";
            const $iRepLen = $sReplacementStr.length;
            for (let $iK = 0; $iK < $iRepLen; $iK = $iK + 1) {
        const $sC = $sReplacementStr.substring( $iK, ( $iK) + ( 1));
                if ($sC === "$" && $iK + 1 < $iRepLen) {
          const $sNextC = $sReplacementStr.substring( $iK + 1, ( $iK + 1) + ( 1));
                    const $iCode = $sNextC.charCodeAt( 0);
                    if ($iCode >= 48 && $iCode <= 57) {
            const $iGIdx = $iCode - 48;
                        if ($iGIdx <= $iGroupCount) {
              const $iGs = $mR["saves"][$iGIdx * 2];
                            const $iGe = $mR["saves"][$iGIdx * 2 + 1];
                            if ($iGs >= 0 && $iGe >= 0) {
                const $sSubB = $sStr.substring( $iGs, ( $iGs) + ( $iGe - $iGs));
                                $sRepResult = $sRepResult + "" + $sSubB;
              }
            }
            $iK = $iK + 1;
          }
          else {
            $sRepResult = $sRepResult + "" + $sC;
          }
        }
        else {
          $sRepResult = $sRepResult + "" + $sC;
        }
      }
      $sResult = $sResult + "" + $sRepResult;
            
            if ($iMatchEnd === $iMatchIndex) {
        if ($iMatchIndex < $iN) {
          const $sSubC = $sStr.substring( $iMatchIndex, ( $iMatchIndex) + ( 1));
                    $sResult = $sResult + "" + $sSubC;
        }
        $i = $iMatchIndex + 1;
      }
      else {
        $i = $iMatchEnd;
      }
      if ($bGlobal === false) {
        const $sSubD = $sStr.substring( $i, ( $i) + ( $iN - $i));
                $sResult = $sResult + "" + $sSubD;
                break;
      }
    }
    else {
      const $sSubE = $sStr.substring( $i, ( $i) + ( $iN - $i));
            $sResult = $sResult + "" + $sSubE;
            break;
    }
  }
  return $sResult;
};
const $bRegexTest = function($sPatternStr, $sStr, $sFlags) {
  const $mR = $mRegexMatch($sPatternStr, $sStr, $sFlags);
    if (Object.prototype.hasOwnProperty.call($mR,  "matched") && $mR["matched"] === true) {
    return true;
  }
  return false;
};
const $mRgx = JSOL.dict(
    "match",  $mRegexMatch, 
    "replace",  $sRegexReplace, 
    "test",  $bRegexTest
);