<?php
// @JSOL v0.2.91 - Pure JSOL Regex Engine (Thompson VM)

$parseAtom = function($pat, $i, $n, $gc, $fns) {
    $c = mb_substr($pat,  $i,  1, "UTF-8");
    if ($c === "(") {
        $i = $i + 1;
        $gc = $gc + 1;
        $idx = $gc;
        $pAltFn = $fns["parseAlt"];
        $r = $pAltFn($pat, $i, $n, $gc, $fns);
        $body = $r["node"];
        $i = $r["i"];
        $gc = $r["groupCount"];
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "group", "index", $idx, "body", $body), "i", $i, "groupCount", $gc);
    }
    if ($c === "[") {
        $i = $i + 1;
        $negate = false;
        if ($i < $n && mb_substr($pat,  $i,  1, "UTF-8") === "^") {
            $negate = true;
            $i = $i + 1;
        }
        $ranges = [];
        $singles = [];
        $first = true;
        while ($i < $n && (mb_substr($pat,  $i,  1, "UTF-8") !== "]" || $first)) {
            $first = false;
            $ch = mb_substr($pat,  $i,  1, "UTF-8");
            $isShorthand = false;
            if ($ch === "\\") {
                $i = $i + 1;
                $e = mb_substr($pat,  $i,  1, "UTF-8");
                if ($e === "d") {
                    $r09 = ["0", "9"]; $ranges[] =  $r09;
                    $isShorthand = true;
                    $i = $i + 1;
                } else if ($e === "w") {
                    $raz = ["a", "z"]; $ranges[] =  $raz;
                    $rAZ = ["A", "Z"]; $ranges[] =  $rAZ;
                    $r09w = ["0", "9"]; $ranges[] =  $r09w;
                    $singles[] =  "_";
                    $isShorthand = true;
                    $i = $i + 1;
                } else if ($e === "s") {
                    $singles[] =  " "; $singles[] =  "\t"; $singles[] =  "\n"; $singles[] =  "\r";
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
            if ($i < $n && mb_substr($pat,  $i,  1, "UTF-8") === "-" && $i + 1 < $n && mb_substr($pat,  $i + 1,  1, "UTF-8") !== "]") {
                $i = $i + 1;
                $ch2 = mb_substr($pat,  $i,  1, "UTF-8");
                if ($ch2 === "\\") {
                    $i = $i + 1;
                    $ch2 = mb_substr($pat,  $i,  1, "UTF-8");
                    $i = $i + 1;
                } else {
                    $i = $i + 1;
                }
                $rng = [$ch, $ch2];
                $ranges[] =  $rng;
            } else {
                $singles[] =  $ch;
            }
        }
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "class", "negate", $negate, "ranges", $ranges, "singles", $singles), "i", $i, "groupCount", $gc);
    }
    if ($c === ".") {
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "any"), "i", $i, "groupCount", $gc);
    }
    if ($c === "^") {
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "anchorStart"), "i", $i, "groupCount", $gc);
    }
    if ($c === "$") {
        $i = $i + 1;
        return JSOL::dict("node", JSOL::dict("type", "anchorEnd"), "i", $i, "groupCount", $gc);
    }
    if ($c === "\\") {
        $i = $i + 1;
        $e = mb_substr($pat,  $i,  1, "UTF-8");
        $i = $i + 1;
        if ($e === "d") { $rd = [["0", "9"]]; return JSOL::dict("node", JSOL::dict("type", "class", "negate", false, "ranges", $rd, "singles", []), "i", $i, "groupCount", $gc); }
        if ($e === "w") { $rw = [["a", "z"], ["A", "Z"], ["0", "9"]]; $sw = ["_"]; return JSOL::dict("node", JSOL::dict("type", "class", "negate", false, "ranges", $rw, "singles", $sw), "i", $i, "groupCount", $gc); }
        if ($e === "s") { $ss = [" ", "\t", "\n", "\r"]; return JSOL::dict("node", JSOL::dict("type", "class", "negate", false, "ranges", [], "singles", $ss), "i", $i, "groupCount", $gc); }
        return JSOL::dict("node", JSOL::dict("type", "char", "value", $e), "i", $i, "groupCount", $gc);
    }
    $i = $i + 1;
    return JSOL::dict("node", JSOL::dict("type", "char", "value", $c), "i", $i, "groupCount", $gc);
};

$parseQuantified = function($pat, $i, $n, $gc, $fns) {
    $paFn = $fns["parseAtom"];
    $r = $paFn($pat, $i, $n, $gc, $fns);
    $atom = $r["node"];
    $i = $r["i"];
    $gc = $r["groupCount"];

    while ($i < $n) {
        $c = mb_substr($pat,  $i,  1, "UTF-8");
        if ($c === "*") {
            $i = $i + 1;
            $lazy = false;
            if ($i < $n && mb_substr($pat,  $i,  1, "UTF-8") === "?") { $lazy = true; $i = $i + 1; }
            $atom = JSOL::dict("type", "rep", "min", 0, "max", 999999, "lazy", $lazy, "body", $atom);
        } else if ($c === "+") {
            $i = $i + 1;
            $lazy = false;
            if ($i < $n && mb_substr($pat,  $i,  1, "UTF-8") === "?") { $lazy = true; $i = $i + 1; }
            $atom = JSOL::dict("type", "rep", "min", 1, "max", 999999, "lazy", $lazy, "body", $atom);
        } else if ($c === "?") {
            $i = $i + 1;
            $lazy = false;
            if ($i < $n && mb_substr($pat,  $i,  1, "UTF-8") === "?") { $lazy = true; $i = $i + 1; }
            $atom = JSOL::dict("type", "rep", "min", 0, "max", 1, "lazy", $lazy, "body", $atom);
        } else {
            break;
        }
    }
    return JSOL::dict("node", $atom, "i", $i, "groupCount", $gc);
};

$parseConcat = function($pat, $i, $n, $gc, $fns) {
    $parts = [];
    $pqFn = $fns["parseQuantified"];
    while ($i < $n && mb_substr($pat,  $i,  1, "UTF-8") !== "|" && mb_substr($pat,  $i,  1, "UTF-8") !== ")") {
        $r = $pqFn($pat, $i, $n, $gc, $fns);
        $parts[] =  $r["node"];
        $i = $r["i"];
        $gc = $r["groupCount"];
    }
    return JSOL::dict("node", JSOL::dict("type", "concat", "parts", $parts), "i", $i, "groupCount", $gc);
};

$parseAlt = function($pat, $i, $n, $gc, $fns) {
    $options = [];
    $pcFn = $fns["parseConcat"];
    $r1 = $pcFn($pat, $i, $n, $gc, $fns);
    $options[] =  $r1["node"];
    $i = $r1["i"];
    $gc = $r1["groupCount"];

    while ($i < $n && mb_substr($pat,  $i,  1, "UTF-8") === "|") {
        $i = $i + 1;
        $r2 = $pcFn($pat, $i, $n, $gc, $fns);
        $options[] =  $r2["node"];
        $i = $r2["i"];
        $gc = $r2["groupCount"];
    }
    if (count($options) === 1) { return JSOL::dict("node", $options[0], "i", $i, "groupCount", $gc); }
    return JSOL::dict("node", JSOL::dict("type", "alt", "options", $options), "i", $i, "groupCount", $gc);
};

$parsePattern = function($pat) use ($parseAlt, $parseConcat, $parseQuantified, $parseAtom) {

    $fns = JSOL::dict(
        "parseAlt", $parseAlt,
        "parseConcat", $parseConcat,
        "parseQuantified", $parseQuantified,
        "parseAtom", $parseAtom
    );
    $n = mb_strlen($pat, "UTF-8");
    $r = $parseAlt($pat, 0, $n, 0, $fns);
    return JSOL::dict("tree", $r["node"], "groupCount", $r["groupCount"]);
};

$gen = function($n, $prog, $selfFn) {
    $type = $n["type"];
    if ($type === "concat") {
        $parts = $n["parts"];
        $pCount = count($parts);
        for ($p = 0; $p < $pCount; $p = $p + 1) { 
            $prog = $selfFn($parts[$p], $prog, $selfFn); 
        }
    } else if ($type === "alt") {
        $options = $n["options"];
        $oCount = count($options);
        $jmpEnds = [];
        for ($idx = 0; $idx < $oCount; $idx = $idx + 1) {
            if ($idx < $oCount - 1) {
                $splitPc = count($prog);
                $prog[] =  JSOL::dict("op", "SPLIT", "x", 0, "y", 0);
                $x = count($prog);
                $prog = $selfFn($options[$idx], $prog, $selfFn);
                $jmpPc = count($prog);
                $prog[] =  JSOL::dict("op", "JMP", "to", 0);
                $jmpEnds[] =  $jmpPc;
                $prog[$splitPc]["x"] = $x;
                $prog[$splitPc]["y"] = count($prog);
            } else {
                $prog = $selfFn($options[$idx], $prog, $selfFn);
            }
        }
        $jCount = count($jmpEnds);
        for ($j = 0; $j < $jCount; $j = $j + 1) {
            $prog[$jmpEnds[$j]]["to"] = count($prog);
        }
    } else if ($type === "rep") {
        $min = $n["min"];
        $max = $n["max"];
        $lazy = $n["lazy"];
        for ($c = 0; $c < $min; $c = $c + 1) { 
            $prog = $selfFn($n["body"], $prog, $selfFn); 
        }
        if ($max === 999999) {
            $splitPc = count($prog);
            $prog[] =  JSOL::dict("op", "SPLIT", "x", 0, "y", 0);
            $bodyStart = count($prog);
            $prog = $selfFn($n["body"], $prog, $selfFn);
            $prog[] =  JSOL::dict("op", "JMP", "to", $splitPc);
            if ($lazy === true) {
                $prog[$splitPc]["x"] = count($prog);
                $prog[$splitPc]["y"] = $bodyStart;
            } else {
                $prog[$splitPc]["x"] = $bodyStart;
                $prog[$splitPc]["y"] = count($prog);
            }
        } else {
            $optional = $max - $min;
            for ($c = 0; $c < $optional; $c = $c + 1) {
                $splitPc = count($prog);
                $prog[] =  JSOL::dict("op", "SPLIT", "x", 0, "y", 0);
                $bodyStart = count($prog);
                $prog = $selfFn($n["body"], $prog, $selfFn);
                if ($lazy === true) {
                    $prog[$splitPc]["x"] = count($prog);
                    $prog[$splitPc]["y"] = $bodyStart;
                } else {
                    $prog[$splitPc]["x"] = $bodyStart;
                    $prog[$splitPc]["y"] = count($prog);
                }
            }
        }
    } else if ($type === "group") {
        $prog[] =  JSOL::dict("op", "SAVE", "slot", $n["index"] * 2);
        $prog = $selfFn($n["body"], $prog, $selfFn);
        $prog[] =  JSOL::dict("op", "SAVE", "slot", $n["index"] * 2 + 1);
    } else if ($type === "char") {
        $prog[] =  JSOL::dict("op", "CHAR", "value", $n["value"]);
    } else if ($type === "any") {
        $prog[] =  JSOL::dict("op", "ANY");
    } else if ($type === "class") {
        $prog[] =  JSOL::dict("op", "CLASS", "negate", $n["negate"], "ranges", $n["ranges"], "singles", $n["singles"]);
    } else if ($type === "anchorStart") {
        $prog[] =  JSOL::dict("op", "BOL");
    } else if ($type === "anchorEnd") {
        $prog[] =  JSOL::dict("op", "EOL");
    }
    return $prog;
};

$compileRegex = function($node, $groupCount) use ($gen) {

    $prog = [];
    $prog[] =  JSOL::dict("op", "SAVE", "slot", 0);
    $prog = $gen($node, $prog, $gen);
    $prog[] =  JSOL::dict("op", "SAVE", "slot", 1);
    $prog[] =  JSOL::dict("op", "MATCH");
    return $prog;
};

$toLower = function($ch) {
    $code = mb_ord(mb_substr($ch,  0, 1, "UTF-8"));
    if ($code >= 65 && $code <= 90) { return mb_chr($code + 32, "UTF-8"); }
    return $ch;
};

$charMatches = function($instr, $ch, $ci) use ($toLower) {

    $inSet = false;
    $chComp = $ci === true ? $toLower($ch) : $ch;
    $cCode = mb_ord(mb_substr($chComp,  0, 1, "UTF-8"));

    $singles = $instr["singles"];
    $sCount = count($singles);
    for ($i = 0; $i < $sCount; $i = $i + 1) {
        $s = $singles[$i];
        $sComp = $ci === true ? $toLower($s) : $s;
        if ($sComp === $chComp) { $inSet = true; }
    }

    $ranges = $instr["ranges"];
    $rCount = count($ranges);
    for ($i = 0; $i < $rCount; $i = $i + 1) {
        $r = $ranges[$i];
        $a = $ci === true ? $toLower($r[0]) : $r[0];
        $b = $ci === true ? $toLower($r[1]) : $r[1];
        $aCode = mb_ord(mb_substr($a,  0, 1, "UTF-8"));
        $bCode = mb_ord(mb_substr($b,  0, 1, "UTF-8"));
        if ($cCode >= $aCode && $cCode <= $bCode) { $inSet = true; }
    }

    if ($instr["negate"] === true) { return !$inSet; }
    return $inSet;
};

$runRegex = function($prog, $str, $ci, $groupCount, $startSp) use ($charMatches, $toLower) {

    $n = mb_strlen($str, "UTF-8");
    $pc = 0;
    $sp = $startSp;
    $saves = [];
    $savesLen = ($groupCount + 1) * 2;
    for ($i = 0; $i < $savesLen; $i = $i + 1) { $saves[] =  -1; }

    $stack = [];
    $stackPtr = 0;

    $running = true;
    $matched = false;

    while ($running === true) {
        $instr = $prog[$pc];
        $ok = true;
        $op = $instr["op"];

        if ($op === "CHAR") {
            if ($sp < $n) {
                $ch = mb_substr($str,  $sp,  1, "UTF-8");
                $val = $instr["value"];
                $match = $ci === true ? ($toLower($ch) === $toLower($val)) : ($ch === $val);
                if ($match === true) { $sp = $sp + 1; $pc = $pc + 1; } else { $ok = false; }
            } else { $ok = false; }
        } else if ($op === "ANY") {
            if ($sp < $n) { $sp = $sp + 1; $pc = $pc + 1; } else { $ok = false; }
        } else if ($op === "CLASS") {
            if ($sp < $n) {
                $ch = mb_substr($str,  $sp,  1, "UTF-8");
                if ($charMatches($instr, $ch, $ci) === true) { $sp = $sp + 1; $pc = $pc + 1; } else { $ok = false; }
            } else { $ok = false; }
        } else if ($op === "BOL") {
            if ($sp === 0) { $pc = $pc + 1; } else { $ok = false; }
        } else if ($op === "EOL") {
            if ($sp === $n) { $pc = $pc + 1; } else { $ok = false; }
        } else if ($op === "JMP") {
            $pc = $instr["to"];
        } else if ($op === "SPLIT") {
            $savesCopy = [];
            for ($i = 0; $i < $savesLen; $i = $i + 1) { $savesCopy[] =  $saves[$i]; }
            $frame = JSOL::dict("pc", $instr["y"], "sp", $sp, "saves", $savesCopy);
            if ($stackPtr < count($stack)) { $stack[$stackPtr] = $frame; } else { $stack[] =  $frame; }
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
                $f = $stack[$stackPtr];
                $pc = $f["pc"];
                $sp = $f["sp"];
                $saves = $f["saves"];
            }
        }
    }

    return JSOL::dict("matched", $matched, "saves", $saves);
};

$regexMatch = function($patternStr, $str, $flags) use ($parsePattern, $compileRegex, $runRegex) {

    $ci = false;
    $global = false;
    if (JSOL::strIndexOf($flags,  "i") !== -1) { $ci = true; }
    if (JSOL::strIndexOf($flags,  "g") !== -1) { $global = true; }

    $parsed = $parsePattern($patternStr);
    $prog = $compileRegex($parsed["tree"], $parsed["groupCount"]);
    $groupCount = $parsed["groupCount"];

    $n = mb_strlen($str, "UTF-8");
    for ($start = 0; $start <= $n; $start = $start + 1) {
        $r = $runRegex($prog, $str, $ci, $groupCount, $start);
        if ($r["matched"] === true) {
            $groups = [];
            for ($g = 0; $g <= $groupCount; $g = $g + 1) {
                $s = $r["saves"][$g * 2];
                $e = $r["saves"][$g * 2 + 1];
                if ($s >= 0 && $e >= 0) {
                    $subG = mb_substr($str,  $s,  $e - $s, "UTF-8");
                    $groups[] =  $subG;
                } else {
                    $groups[] =  null;
                }
            }
            return JSOL::dict("matched", true, "groups", $groups, "index", $start, "length", $r["saves"][1] - $r["saves"][0]);
        }
    }
    return JSOL::dict("matched", false, "groups", [], "index", -1, "length", 0);
};

$regexReplace = function($patternStr, $replacementStr, $str, $flags) use ($parsePattern, $compileRegex, $runRegex) {

    $ci = false;
    $global = false;
    if (JSOL::strIndexOf($flags,  "i") !== -1) { $ci = true; }
    if (JSOL::strIndexOf($flags,  "g") !== -1) { $global = true; }

    $parsed = $parsePattern($patternStr);
    $prog = $compileRegex($parsed["tree"], $parsed["groupCount"]);
    $groupCount = $parsed["groupCount"];

    $result = "";
    $i = 0;
    $n = mb_strlen($str, "UTF-8");

    while ($i <= $n) {
        $matchFound = false;
        $r = null;
        $matchIndex = $i;
        
        for ($start = $i; $start <= $n; $start = $start + 1) {
            $r = $runRegex($prog, $str, $ci, $groupCount, $start);
            if ($r["matched"] === true) {
                $matchFound = true;
                $matchIndex = $start;
                break;
            }
        }

        if ($matchFound === true) {
            $matchStart = $r["saves"][0];
            $matchEnd = $r["saves"][1];

            $subA = mb_substr($str,  $i,  $matchStart - $i, "UTF-8");
            $result = $result . "" . $subA;

            $repResult = "";
            $repLen = mb_strlen($replacementStr, "UTF-8");
            for ($k = 0; $k < $repLen; $k = $k + 1) {
                $c = mb_substr($replacementStr,  $k,  1, "UTF-8");
                if ($c === "$" && $k + 1 < $repLen) {
                    $nextC = mb_substr($replacementStr,  $k + 1,  1, "UTF-8");
                    $code = mb_ord(mb_substr($nextC,  0, 1, "UTF-8"));
                    if ($code >= 48 && $code <= 57) { 
                        $gIdx = $code - 48;
                        if ($gIdx <= $groupCount) {
                            $gs = $r["saves"][$gIdx * 2];
                            $ge = $r["saves"][$gIdx * 2 + 1];
                            if ($gs >= 0 && $ge >= 0) {
                                $subB = mb_substr($str,  $gs,  $ge - $gs, "UTF-8");
                                $repResult = $repResult . "" . $subB;
                            }
                        }
                        $k = $k + 1;
                    } else {
                        $repResult = $repResult . "" . $c;
                    }
                } else {
                    $repResult = $repResult . "" . $c;
                }
            }

            $result = $result . "" . $repResult;
            
            if ($matchEnd === $matchIndex) {
                if ($matchIndex < $n) {
                    $subC = mb_substr($str,  $matchIndex,  1, "UTF-8");
                    $result = $result . "" . $subC;
                }
                $i = $matchIndex + 1;
            } else {
                $i = $matchEnd;
            }

            if ($global === false) {
                $subD = mb_substr($str,  $i,  $n - $i, "UTF-8");
                $result = $result . "" . $subD;
                break;
            }
        } else {
            $subE = mb_substr($str,  $i,  $n - $i, "UTF-8");
            $result = $result . "" . $subE;
            break;
        }
    }

    return $result;
};

$mRegex = JSOL::dict(
    "match", $regexMatch,
    "replace", $regexReplace
);