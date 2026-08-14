// @JSOL v0.2.93

/**
 * @description
 * A complete validation suite that tests every primitive domain method specified in JSOL v0.3.
 * Designed using a STRICT SWITCH routing pattern to specifically stress-test the compiler's 
 * support for 'switch' statements without fallthrough. Each method is evaluated in isolation 
 * as a separate row in the JSOL REPL Interpreter, preventing a single unimplemented function 
 * from crashing the entire test suite.
 *
 * @param {string} $sMethod - The name of the method to evaluate.
 * @returns {string} - The stringified result of the evaluation.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$sMethod": "Str.len" },
 *     { "$sMethod": "Str.sub" },
 *     { "$sMethod": "Str.indexOf" },
 *     { "$sMethod": "Str.replace" },
 *     { "$sMethod": "Str.char" },
 *     { "$sMethod": "Str.fromChar" },
 *     { "$sMethod": "Str.upper" },
 *     { "$sMethod": "Str.lower" },
 *     { "$sMethod": "Str.trim" },
 *     { "$sMethod": "Str.split" },
 *     { "$sMethod": "Arr.count" },
 *     { "$sMethod": "Arr.push" },
 *     { "$sMethod": "Arr.pop" },
 *     { "$sMethod": "Arr.shift" },
 *     { "$sMethod": "Arr.slice" },
 *     { "$sMethod": "Arr.indexOf" },
 *     { "$sMethod": "Arr.join" },
 *     { "$sMethod": "Map.create" },
 *     { "$sMethod": "Map.has" },
 *     { "$sMethod": "Map.keys" },
 *     { "$sMethod": "Math.floor" },
 *     { "$sMethod": "Math.abs" },
 *     { "$sMethod": "Math.pow" },
 *     { "$sMethod": "Math.min" },
 *     { "$sMethod": "Math.max" },
 *     { "$sMethod": "Math.round" },
 *     { "$sMethod": "Bit.and" },
 *     { "$sMethod": "Bit.or" },
 *     { "$sMethod": "Bit.xor" },
 *     { "$sMethod": "Bit.not" },
 *     { "$sMethod": "Bit.shiftL" },
 *     { "$sMethod": "Bit.shiftR" },
 *     { "$sMethod": "Cast.toStr" },
 *     { "$sMethod": "Cast.toInt" },
 *     { "$sMethod": "Cast.toFloat" },
 *     { "$sMethod": "Regex.match" },
 *     { "$sMethod": "Regex.replace" },
 *     { "$sMethod": "Regex.test" }
 *   ]
 * }
 */

const $sTestPrimitive = function($sMethod) {
    switch ($sMethod) {
        case "Str.len": return Cast.toStr(Str.len("abc"));
        case "Str.sub": return Str.sub("abc", 1, 1);
        case "Str.indexOf": return Cast.toStr(Str.indexOf("abc", "b"));
        case "Str.replace": return Str.replace("abc", "b", "x");
        case "Str.char": return Cast.toStr(Str.char("abc", 0));
        case "Str.fromChar": return Str.fromChar(97);
        case "Str.upper": return Str.upper("abc");
        case "Str.lower": return Str.lower("ABC");
        case "Str.trim": return Str.trim(" abc ");
        case "Str.split": {
            const $aSplit = Str.split("a,b", ",");
            return Arr.join($aSplit, "-");
        }

        case "Arr.count": return Cast.toStr(Arr.count(["x", "y"]));
        case "Arr.push": {
            const $aPush = ["x", "y"];
            Arr.push($aPush, "z");
            return Arr.join($aPush, "-");
        }
        case "Arr.pop": {
            const $aPop = ["x", "y", "z"];
            const $sPopped = Arr.pop($aPop);
            return "popped: " + "" + $sPopped + "" + " left: " + "" + Arr.join($aPop, "-");
        }
        case "Arr.shift": {
            const $aShift = ["x", "y"];
            const $sShifted = Arr.shift($aShift);
            return "shifted: " + "" + $sShifted + "" + " left: " + "" + Arr.join($aShift, "-");
        }
        case "Arr.slice": {
            const $aSlice = Arr.slice(["a", "b", "c"], 1, 3);
            return Arr.join($aSlice, "-");
        }
        case "Arr.indexOf": return Cast.toStr(Arr.indexOf(["a", "b", "c"], "b"));
        case "Arr.join": return Arr.join(["a", "b"], ",");

        case "Map.create": {
            const $mTest1 = Map.create("k1", "v1");
            if ($mTest1["k1"] === "v1") { return "ok"; }
            return "fail";
        }
        case "Map.has": {
            const $mTest2 = Map.create("k1", "v1");
            return Cast.toStr(Map.has($mTest2, "k1"));
        }
        case "Map.keys": {
            const $mTest3 = Map.create("k1", "v1", "k2", "v2");
            const $aKeys = Map.keys($mTest3);
            return Arr.join($aKeys, "-");
        }

        case "Math.floor": return Cast.toStr(Math.floor(1.9));
        case "Math.abs": return Cast.toStr(Math.abs(-5));
        case "Math.pow": return Cast.toStr(Math.pow(2, 3));
        case "Math.min": return Cast.toStr(Math.min(10, 2));
        case "Math.max": return Cast.toStr(Math.max(10, 2));
        case "Math.round": return Cast.toStr(Math.round(1.5));

        case "Bit.and": return Cast.toStr(Bit.and(3, 1));
        case "Bit.or": return Cast.toStr(Bit.or(1, 2));
        case "Bit.xor": return Cast.toStr(Bit.xor(1, 3));
        case "Bit.not": return Cast.toStr(Bit.not(1));
        case "Bit.shiftL": return Cast.toStr(Bit.shiftL(1, 1));
        case "Bit.shiftR": return Cast.toStr(Bit.shiftR(2, 1));

        case "Cast.toStr": return Cast.toStr(100);
        case "Cast.toInt": return Cast.toStr(Cast.toInt("100"));
        case "Cast.toFloat": return Cast.toStr(Cast.toFloat("100.5"));

        case "Regex.match": {
            const $mMatch = Regex.match("^a(b)c$", "abc", "i");
            if (Map.has($mMatch, "matched") && $mMatch["matched"] === true) {
                return "true";
            }
            return "false";
        }
        case "Regex.replace": return Regex.replace("a", "x", "abc", "");
        case "Regex.test": return Cast.toStr(Regex.test("^a", "abc", ""));

        default: return "Unknown method";
    }
};