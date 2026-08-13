// @JSOL v0.2.91 - Pure JSOL Regex Engine (Thompson VM)

const $parseAtom = function($pat, $i, $n, $gc, $fns) {
    const $c = $pat.substring( $i, ( $i) + ( 1));
    if ($c === "(") {
        $i = $i + 1;
        $gc = $gc + 1;
        const $idx = $gc;
        const $pAltFn = $fns["parseAlt"];
        let $r = $pAltFn($pat, $i, $n, $gc, $fns);
        const $body = $r["node"];
        $i = $r["i"];
        $gc = $r["groupCount"];
        $i = $i + 1;
        return JSOL.dict("node", JSOL.dict("type", "group", "index", $idx, "body", $body), "i", $i, "groupCount", $gc);
    }
    if ($c === "[") {
        $i = $i + 1;
        let $negate = false;
        if ($i < $n && $pat.substring( $i, ( $i) + ( 1)) === "^") {
            $negate = true;
            $i = $i + 1;
        }
        let $ranges = [];
        let $singles = [];
        let $first = true;
        while ($i < $n && ($pat.substring( $i, ( $i) + ( 1)) !== "]" || $first)) {
            $first = false;
            let $ch = $pat.substring( $i, ( $i) + ( 1));
            let $isShorthand = false;
            if ($ch === "\\") {
                $i = $i + 1;
                const $e = $pat.substring( $i, ( $i) + ( 1));
                if ($e === "d") {
                    const $r09 = ["0", "9"]; $ranges.push( $r09);
                    $isShorthand = true;
                    $i = $i + 1;
                } else if ($e === "w") {
                    const $raz = ["a", "z"]; $ranges.push( $raz);
                    const $rAZ = ["A", "Z"]; $ranges.push( $rAZ);
                    const $r09w = ["0", "9"]; $ranges.push( $r09w);
                    $singles.push( "_");
                    $isShorthand = true;
                    $i = $i + 1;
                } else if ($e === "s") {
                    $singles.push( " "); $singles.push( "\t"); $singles.push( "\n"); $singles.push( "\r");
                    $isShorthand = true;
                    $i = $i + 1;
                } else {
                    $ch = $e;
                    $i = $i + 1;
                }
            } else {
                $i = $i + 1;
            }
            if ($isShorthand === true) { continue; }
            if ($i < $n && $pat.substring( $i, ( $i) + ( 1)) === "-" && $i + 1 < $n && $pat.substring( $i + 1, ( $i + 1) + ( 1)) !== "]") {
                $i = $i + 1;
                let $ch2 = $pat.substring( $i, ( $i) + ( 1));
                if ($ch2 === "\\") {
                    $i = $i + 1;
                    $ch2 = $pat.substring( $i, ( $i) + ( 1));
                    $i = $i + 1;
                } else {
                    $i = $i + 1;
                }
                const $rng = [$ch, $ch2];
                $ranges.push( $rng);
            } else {
                $singles.push( $ch);
            }
        }
        $i = $i + 1;
        return JSOL.dict("node", JSOL.dict("type", "class", "negate", $negate, "ranges", $ranges, "singles", $singles), "i", $i, "groupCount", $gc);
    }
    if ($c === ".") {
        $i = $i + 1;
        return JSOL.dict("node", JSOL.dict("type", "any"), "i", $i, "groupCount", $gc);
    }
    if ($c === "^") {
        $i = $i + 1;
        return JSOL.dict("node", JSOL.dict("type", "anchorStart"), "i", $i, "groupCount", $gc);
    }
    if ($c === "$") {
        $i = $i + 1;
        return JSOL.dict("node", JSOL.dict("type", "anchorEnd"), "i", $i, "groupCount", $gc);
    }
    if ($c === "\\") {
        $i = $i + 1;
        const $e = $pat.substring( $i, ( $i) + ( 1));
        $i = $i + 1;
        if ($e === "d") { const $rd = [["0", "9"]]; return JSOL.dict("node", JSOL.dict("type", "class", "negate", false, "ranges", $rd, "singles", []), "i", $i, "groupCount", $gc); }
        if ($e === "w") { const $rw = [["a", "z"], ["A", "Z"], ["0", "9"]]; const $sw = ["_"]; return JSOL.dict("node", JSOL.dict("type", "class", "negate", false, "ranges", $rw, "singles", $sw), "i", $i, "groupCount", $gc); }
        if ($e === "s") { const $ss = [" ", "\t", "\n", "\r"]; return JSOL.dict("node", JSOL.dict("type", "class", "negate", false, "ranges", [], "singles", $ss), "i", $i, "groupCount", $gc); }
        return JSOL.dict("node", JSOL.dict("type", "char", "value", $e), "i", $i, "groupCount", $gc);
    }
    $i = $i + 1;
    return JSOL.dict("node", JSOL.dict("type", "char", "value", $c), "i", $i, "groupCount", $gc);
};

const $parseQuantified = function($pat, $i, $n, $gc, $fns) {
    const $paFn = $fns["parseAtom"];
    let $r = $paFn($pat, $i, $n, $gc, $fns);
    let $atom = $r["node"];
    $i = $r["i"];
    $gc = $r["groupCount"];

    while ($i < $n) {
        const $c = $pat.substring( $i, ( $i) + ( 1));
        if ($c === "*") {
            $i = $i + 1;
            let $lazy = false;
            if ($i < $n && $pat.substring( $i, ( $i) + ( 1)) === "?") { $lazy = true; $i = $i + 1; }
            $atom = JSOL.dict("type", "rep", "min", 0, "max", 999999, "lazy", $lazy, "body", $atom);
        } else if ($c === "+") {
            $i = $i + 1;
            let $lazy = false;
            if ($i < $n && $pat.substring( $i, ( $i) + ( 1)) === "?") { $lazy = true; $i = $i + 1; }
            $atom = JSOL.dict("type", "rep", "min", 1, "max", 999999, "lazy", $lazy, "body", $atom);
        } else if ($c === "?") {
            $i = $i + 1;
            let $lazy = false;
            if ($i < $n && $pat.substring( $i, ( $i) + ( 1)) === "?") { $lazy = true; $i = $i + 1; }
            $atom = JSOL.dict("type", "rep", "min", 0, "max", 1, "lazy", $lazy, "body", $atom);
        } else {
            break;
        }
    }
    return JSOL.dict("node", $atom, "i", $i, "groupCount", $gc);
};

const $parseConcat = function($pat, $i, $n, $gc, $fns) {
    let $parts = [];
    const $pqFn = $fns["parseQuantified"];
    while ($i < $n && $pat.substring( $i, ( $i) + ( 1)) !== "|" && $pat.substring( $i, ( $i) + ( 1)) !== ")") {
        let $r = $pqFn($pat, $i, $n, $gc, $fns);
        $parts.push( $r["node"]);
        $i = $r["i"];
        $gc = $r["groupCount"];
    }
    return JSOL.dict("node", JSOL.dict("type", "concat", "parts", $parts), "i", $i, "groupCount", $gc);
};

const $parseAlt = function($pat, $i, $n, $gc, $fns) {
    let $options = [];
    const $pcFn = $fns["parseConcat"];
    let $r1 = $pcFn($pat, $i, $n, $gc, $fns);
    $options.push( $r1["node"]);
    $i = $r1["i"];
    $gc = $r1["groupCount"];

    while ($i < $n && $pat.substring( $i, ( $i) + ( 1)) === "|") {
        $i = $i + 1;
        let $r2 = $pcFn($pat, $i, $n, $gc, $fns);
        $options.push( $r2["node"]);
        $i = $r2["i"];
        $gc = $r2["groupCount"];
    }
    if ($options.length === 1) { return JSOL.dict("node", $options[0], "i", $i, "groupCount", $gc); }
    return JSOL.dict("node", JSOL.dict("type", "alt", "options", $options), "i", $i, "groupCount", $gc);
};

const $parsePattern = function($pat) {
    
    const $fns = JSOL.dict(
        "parseAlt", $parseAlt,
        "parseConcat", $parseConcat,
        "parseQuantified", $parseQuantified,
        "parseAtom", $parseAtom
    );
    const $n = $pat.length;
    const $r = $parseAlt($pat, 0, $n, 0, $fns);
    return JSOL.dict("tree", $r["node"], "groupCount", $r["groupCount"]);
};

const $gen = function($n, $prog, $selfFn) {
    const $type = $n["type"];
    if ($type === "concat") {
        const $parts = $n["parts"];
        const $pCount = $parts.length;
        for (let $p = 0; $p < $pCount; $p = $p + 1) { 
            $prog = $selfFn($parts[$p], $prog, $selfFn); 
        }
    } else if ($type === "alt") {
        const $options = $n["options"];
        const $oCount = $options.length;
        let $jmpEnds = [];
        for (let $idx = 0; $idx < $oCount; $idx = $idx + 1) {
            if ($idx < $oCount - 1) {
                const $splitPc = $prog.length;
                $prog.push( JSOL.dict("op", "SPLIT", "x", 0, "y", 0));
                const $x = $prog.length;
                $prog = $selfFn($options[$idx], $prog, $selfFn);
                const $jmpPc = $prog.length;
                $prog.push( JSOL.dict("op", "JMP", "to", 0));
                $jmpEnds.push( $jmpPc);
                $prog[$splitPc]["x"] = $x;
                $prog[$splitPc]["y"] = $prog.length;
            } else {
                $prog = $selfFn($options[$idx], $prog, $selfFn);
            }
        }
        const $jCount = $jmpEnds.length;
        for (let $j = 0; $j < $jCount; $j = $j + 1) {
            $prog[$jmpEnds[$j]]["to"] = $prog.length;
        }
    } else if ($type === "rep") {
        const $min = $n["min"];
        const $max = $n["max"];
        const $lazy = $n["lazy"];
        for (let $c = 0; $c < $min; $c = $c + 1) { 
            $prog = $selfFn($n["body"], $prog, $selfFn); 
        }
        if ($max === 999999) {
            const $splitPc = $prog.length;
            $prog.push( JSOL.dict("op", "SPLIT", "x", 0, "y", 0));
            const $bodyStart = $prog.length;
            $prog = $selfFn($n["body"], $prog, $selfFn);
            $prog.push( JSOL.dict("op", "JMP", "to", $splitPc));
            if ($lazy === true) {
                $prog[$splitPc]["x"] = $prog.length;
                $prog[$splitPc]["y"] = $bodyStart;
            } else {
                $prog[$splitPc]["x"] = $bodyStart;
                $prog[$splitPc]["y"] = $prog.length;
            }
        } else {
            const $optional = $max - $min;
            for (let $c = 0; $c < $optional; $c = $c + 1) {
                const $splitPc = $prog.length;
                $prog.push( JSOL.dict("op", "SPLIT", "x", 0, "y", 0));
                const $bodyStart = $prog.length;
                $prog = $selfFn($n["body"], $prog, $selfFn);
                if ($lazy === true) {
                    $prog[$splitPc]["x"] = $prog.length;
                    $prog[$splitPc]["y"] = $bodyStart;
                } else {
                    $prog[$splitPc]["x"] = $bodyStart;
                    $prog[$splitPc]["y"] = $prog.length;
                }
            }
        }
    } else if ($type === "group") {
        $prog.push( JSOL.dict("op", "SAVE", "slot", $n["index"] * 2));
        $prog = $selfFn($n["body"], $prog, $selfFn);
        $prog.push( JSOL.dict("op", "SAVE", "slot", $n["index"] * 2 + 1));
    } else if ($type === "char") {
        $prog.push( JSOL.dict("op", "CHAR", "value", $n["value"]));
    } else if ($type === "any") {
        $prog.push( JSOL.dict("op", "ANY"));
    } else if ($type === "class") {
        $prog.push( JSOL.dict("op", "CLASS", "negate", $n["negate"], "ranges", $n["ranges"], "singles", $n["singles"]));
    } else if ($type === "anchorStart") {
        $prog.push( JSOL.dict("op", "BOL"));
    } else if ($type === "anchorEnd") {
        $prog.push( JSOL.dict("op", "EOL"));
    }
    return $prog;
};

const $compileRegex = function($node, $groupCount) {
    
    let $prog = [];
    $prog.push( JSOL.dict("op", "SAVE", "slot", 0));
    $prog = $gen($node, $prog, $gen);
    $prog.push( JSOL.dict("op", "SAVE", "slot", 1));
    $prog.push( JSOL.dict("op", "MATCH"));
    return $prog;
};

const $toLower = function($ch) {
    const $code = $ch.charCodeAt( 0);
    if ($code >= 65 && $code <= 90) { return String.fromCharCode($code + 32); }
    return $ch;
};

const $charMatches = function($instr, $ch, $ci) {
    
    let $inSet = false;
    const $chComp = $ci === true ? $toLower($ch) : $ch;
    const $cCode = $chComp.charCodeAt( 0);

    const $singles = $instr["singles"];
    const $sCount = $singles.length;
    for (let $i = 0; $i < $sCount; $i = $i + 1) {
        const $s = $singles[$i];
        const $sComp = $ci === true ? $toLower($s) : $s;
        if ($sComp === $chComp) { $inSet = true; }
    }

    const $ranges = $instr["ranges"];
    const $rCount = $ranges.length;
    for (let $i = 0; $i < $rCount; $i = $i + 1) {
        const $r = $ranges[$i];
        const $a = $ci === true ? $toLower($r[0]) : $r[0];
        const $b = $ci === true ? $toLower($r[1]) : $r[1];
        const $aCode = $a.charCodeAt( 0);
        const $bCode = $b.charCodeAt( 0);
        if ($cCode >= $aCode && $cCode <= $bCode) { $inSet = true; }
    }

    if ($instr["negate"] === true) { return !$inSet; }
    return $inSet;
};

const $runRegex = function($prog, $str, $ci, $groupCount, $startSp) {
    
    const $n = $str.length;
    let $pc = 0;
    let $sp = $startSp;
    let $saves = [];
    const $savesLen = ($groupCount + 1) * 2;
    for (let $i = 0; $i < $savesLen; $i = $i + 1) { $saves.push( -1); }

    const $stack = [];
    let $stackPtr = 0;

    let $running = true;
    let $matched = false;

    while ($running === true) {
        const $instr = $prog[$pc];
        let $ok = true;
        const $op = $instr["op"];

        if ($op === "CHAR") {
            if ($sp < $n) {
                const $ch = $str.substring( $sp, ( $sp) + ( 1));
                const $val = $instr["value"];
                const $match = $ci === true ? ($toLower($ch) === $toLower($val)) : ($ch === $val);
                if ($match === true) { $sp = $sp + 1; $pc = $pc + 1; } else { $ok = false; }
            } else { $ok = false; }
        } else if ($op === "ANY") {
            if ($sp < $n) { $sp = $sp + 1; $pc = $pc + 1; } else { $ok = false; }
        } else if ($op === "CLASS") {
            if ($sp < $n) {
                const $ch = $str.substring( $sp, ( $sp) + ( 1));
                if ($charMatches($instr, $ch, $ci) === true) { $sp = $sp + 1; $pc = $pc + 1; } else { $ok = false; }
            } else { $ok = false; }
        } else if ($op === "BOL") {
            if ($sp === 0) { $pc = $pc + 1; } else { $ok = false; }
        } else if ($op === "EOL") {
            if ($sp === $n) { $pc = $pc + 1; } else { $ok = false; }
        } else if ($op === "JMP") {
            $pc = $instr["to"];
        } else if ($op === "SPLIT") {
            const $savesCopy = [];
            for (let $i = 0; $i < $savesLen; $i = $i + 1) { $savesCopy.push( $saves[$i]); }
            const $frame = JSOL.dict("pc", $instr["y"], "sp", $sp, "saves", $savesCopy);
            if ($stackPtr < $stack.length) { $stack[$stackPtr] = $frame; } else { $stack.push( $frame); }
            $stackPtr = $stackPtr + 1;
            
            $pc = $instr["x"];
        } else if ($op === "SAVE") {
            $saves[$instr["slot"]] = $sp;
            $pc = $pc + 1;
        } else if ($op === "MATCH") {
            $matched = true;
            $running = false;
        } else {
            $ok = false;
        }

        if ($running === true && $ok === false) {
            if ($stackPtr === 0) { 
                $running = false; 
            } else {
                $stackPtr = $stackPtr - 1;
                const $f = $stack[$stackPtr];
                $pc = $f["pc"];
                $sp = $f["sp"];
                $saves = $f["saves"];
            }
        }
    }

    return JSOL.dict("matched", $matched, "saves", $saves);
};

const $regexMatch = function($patternStr, $str, $flags) {
    
    let $ci = false;
    let $global = false;
    if ($flags.indexOf( "i") !== -1) { $ci = true; }
    if ($flags.indexOf( "g") !== -1) { $global = true; }

    const $parsed = $parsePattern($patternStr);
    const $prog = $compileRegex($parsed["tree"], $parsed["groupCount"]);
    const $groupCount = $parsed["groupCount"];

    const $n = $str.length;
    for (let $start = 0; $start <= $n; $start = $start + 1) {
        const $r = $runRegex($prog, $str, $ci, $groupCount, $start);
        if ($r["matched"] === true) {
            let $groups = [];
            for (let $g = 0; $g <= $groupCount; $g = $g + 1) {
                const $s = $r["saves"][$g * 2];
                const $e = $r["saves"][$g * 2 + 1];
                if ($s >= 0 && $e >= 0) {
                    const $subG = $str.substring( $s, ( $s) + ( $e - $s));
                    $groups.push( $subG);
                } else {
                    $groups.push( null);
                }
            }
            return JSOL.dict("matched", true, "groups", $groups, "index", $start, "length", $r["saves"][1] - $r["saves"][0]);
        }
    }
    return JSOL.dict("matched", false, "groups", [], "index", -1, "length", 0);
};

const $regexReplace = function($patternStr, $replacementStr, $str, $flags) {
    
    let $ci = false;
    let $global = false;
    if ($flags.indexOf( "i") !== -1) { $ci = true; }
    if ($flags.indexOf( "g") !== -1) { $global = true; }

    const $parsed = $parsePattern($patternStr);
    const $prog = $compileRegex($parsed["tree"], $parsed["groupCount"]);
    const $groupCount = $parsed["groupCount"];

    let $result = "";
    let $i = 0;
    const $n = $str.length;

    while ($i <= $n) {
        let $matchFound = false;
        let $r = null;
        let $matchIndex = $i;
        
        for (let $start = $i; $start <= $n; $start = $start + 1) {
            $r = $runRegex($prog, $str, $ci, $groupCount, $start);
            if ($r["matched"] === true) {
                $matchFound = true;
                $matchIndex = $start;
                break;
            }
        }

        if ($matchFound === true) {
            const $matchStart = $r["saves"][0];
            const $matchEnd = $r["saves"][1];

            const $subA = $str.substring( $i, ( $i) + ( $matchStart - $i));
            $result = $result + "" + $subA;

            let $repResult = "";
            const $repLen = $replacementStr.length;
            for (let $k = 0; $k < $repLen; $k = $k + 1) {
                const $c = $replacementStr.substring( $k, ( $k) + ( 1));
                if ($c === "$" && $k + 1 < $repLen) {
                    const $nextC = $replacementStr.substring( $k + 1, ( $k + 1) + ( 1));
                    const $code = $nextC.charCodeAt( 0);
                    if ($code >= 48 && $code <= 57) { 
                        const $gIdx = $code - 48;
                        if ($gIdx <= $groupCount) {
                            const $gs = $r["saves"][$gIdx * 2];
                            const $ge = $r["saves"][$gIdx * 2 + 1];
                            if ($gs >= 0 && $ge >= 0) {
                                const $subB = $str.substring( $gs, ( $gs) + ( $ge - $gs));
                                $repResult = $repResult + "" + $subB;
                            }
                        }
                        $k = $k + 1;
                    } else {
                        $repResult = $repResult + "" + $c;
                    }
                } else {
                    $repResult = $repResult + "" + $c;
                }
            }

            $result = $result + "" + $repResult;
            
            if ($matchEnd === $matchIndex) {
                if ($matchIndex < $n) {
                    const $subC = $str.substring( $matchIndex, ( $matchIndex) + ( 1));
                    $result = $result + "" + $subC;
                }
                $i = $matchIndex + 1;
            } else {
                $i = $matchEnd;
            }

            if ($global === false) {
                const $subD = $str.substring( $i, ( $i) + ( $n - $i));
                $result = $result + "" + $subD;
                break;
            }
        } else {
            const $subE = $str.substring( $i, ( $i) + ( $n - $i));
            $result = $result + "" + $subE;
            break;
        }
    }

    return $result;
};

const $mRegex = JSOL.dict(
    "match", $regexMatch,
    "replace", $regexReplace
);