// @JSOL v0.2.96

/**
 @description

 # Core Primitives Test Suite
 
 A complete validation suite that tests every primitive domain method specified in **JSOL v0.3**.
 Designed using a conservative **IF-ELSE routing pattern**. This structure is used exclusively 
 to test the successful execution of the core domain primitives without introducing unverified 
 control flow mechanisms. A separate file (`.switch.jsol.js`) handles strict switch testing.
 Each method is evaluated in isolation as a separate row in the **JSOL REPL Interpreter**, 
 preventing a single unimplemented function from crashing the entire test suite.
 
 ## Key Design Decisions
 
 - **Conservative Routing**: Uses IF-ELSE pattern to avoid unverified control flow
 - **Isolation**: Each method runs independently to prevent cascade failures
 - **Separate Testing**: Switch statements handled in dedicated `.switch.jsol.js` file
 
 ## Parameters
 
 - **@param {string} $sMethod** - The name of the method to evaluate.
 
 ## Returns
 
 - **@returns {string}** - The stringified result of the evaluation.
 */

/**
 @contract
 {
   "cases": [
     { "$sMethod": "Str.len" },
     { "$sMethod": "Str.sub" },
     { "$sMethod": "Str.indexOf" },
     { "$sMethod": "Str.replace" },
     { "$sMethod": "Str.char" },
     { "$sMethod": "Str.fromChar" },
     { "$sMethod": "Str.upper" },
     { "$sMethod": "Str.lower" },
     { "$sMethod": "Str.trim" },
     { "$sMethod": "Str.split" },
     { "$sMethod": "Arr.count" },
     { "$sMethod": "Arr.push" },
     { "$sMethod": "Arr.pop" },
     { "$sMethod": "Arr.shift" },
     { "$sMethod": "Arr.slice" },
     { "$sMethod": "Arr.indexOf" },
     { "$sMethod": "Arr.join" },
     { "$sMethod": "Map.create" },
     { "$sMethod": "Map.has" },
     { "$sMethod": "Map.keys" },
     { "$sMethod": "Math.floor" },
     { "$sMethod": "Math.abs" },
     { "$sMethod": "Math.pow" },
     { "$sMethod": "Math.min" },
     { "$sMethod": "Math.max" },
     { "$sMethod": "Math.round" },
     { "$sMethod": "Bit.and" },
     { "$sMethod": "Bit.or" },
     { "$sMethod": "Bit.xor" },
     { "$sMethod": "Bit.not" },
     { "$sMethod": "Bit.shiftL" },
     { "$sMethod": "Bit.shiftR" },
     { "$sMethod": "Cast.toStr" },
     { "$sMethod": "Cast.toInt" },
     { "$sMethod": "Cast.toFloat" },
     { "$sMethod": "Regex.match" },
     { "$sMethod": "Regex.replace" },
     { "$sMethod": "Regex.test" }
   ]
 }
*/

const $sTestPrimitive = function($sMethod) {
    if ($sMethod === "Str.len") { return Cast.toStr(Str.len("abc")); }
    if ($sMethod === "Str.sub") { return Str.sub("abc", 1, 1); }
    if ($sMethod === "Str.indexOf") { return Cast.toStr(Str.indexOf("abc", "b")); }
    if ($sMethod === "Str.replace") { return Str.replace("abc", "b", "x"); }
    if ($sMethod === "Str.char") { return Cast.toStr(Str.char("abc", 0)); }
    if ($sMethod === "Str.fromChar") { return Str.fromChar(97); }
    if ($sMethod === "Str.upper") { return Str.upper("abc"); }
    if ($sMethod === "Str.lower") { return Str.lower("ABC"); }
    if ($sMethod === "Str.trim") { return Str.trim(" abc "); }
    if ($sMethod === "Str.split") {
        const $aSplit = Str.split("a,b", ",");
        return Arr.join($aSplit, "-");
    }

    if ($sMethod === "Arr.count") { return Cast.toStr(Arr.count(["x", "y"])); }
    if ($sMethod === "Arr.push") {
        const $aPush = ["x", "y"];
        Arr.push($aPush, "z");
        return Arr.join($aPush, "-");
    }
    if ($sMethod === "Arr.pop") {
        const $aPop = ["x", "y", "z"];
        const $sPopped = Arr.pop($aPop);
        return "popped: " + "" + $sPopped + "" + " left: " + "" + Arr.join($aPop, "-");
    }
    if ($sMethod === "Arr.shift") {
        const $aShift = ["x", "y"];
        const $sShifted = Arr.shift($aShift);
        return "shifted: " + "" + $sShifted + "" + " left: " + "" + Arr.join($aShift, "-");
    }
    if ($sMethod === "Arr.slice") {
        const $aSlice = Arr.slice(["a", "b", "c"], 1, 3);
        return Arr.join($aSlice, "-");
    }
    if ($sMethod === "Arr.indexOf") { return Cast.toStr(Arr.indexOf(["a", "b", "c"], "b")); }
    if ($sMethod === "Arr.join") { return Arr.join(["a", "b"], ","); }

    if ($sMethod === "Map.create") {
        const $mTest1 = Map.create("k1", "v1");
        if ($mTest1["k1"] === "v1") { return "ok"; }
        return "fail";
    }
    if ($sMethod === "Map.has") {
        const $mTest2 = Map.create("k1", "v1");
        return Cast.toStr(Map.has($mTest2, "k1"));
    }
    if ($sMethod === "Map.keys") {
        const $mTest3 = Map.create("k1", "v1", "k2", "v2");
        const $aKeys = Map.keys($mTest3);
        return Arr.join($aKeys, "-");
    }

    if ($sMethod === "Math.floor") { return Cast.toStr(Math.floor(1.9)); }
    if ($sMethod === "Math.abs") { return Cast.toStr(Math.abs(-5)); }
    if ($sMethod === "Math.pow") { return Cast.toStr(Math.pow(2, 3)); }
    if ($sMethod === "Math.min") { return Cast.toStr(Math.min(10, 2)); }
    if ($sMethod === "Math.max") { return Cast.toStr(Math.max(10, 2)); }
    if ($sMethod === "Math.round") { return Cast.toStr(Math.round(1.5)); }

    if ($sMethod === "Bit.and") { return Cast.toStr(Bit.and(3, 1)); }
    if ($sMethod === "Bit.or") { return Cast.toStr(Bit.or(1, 2)); }
    if ($sMethod === "Bit.xor") { return Cast.toStr(Bit.xor(1, 3)); }
    if ($sMethod === "Bit.not") { return Cast.toStr(Bit.not(1)); }
    if ($sMethod === "Bit.shiftL") { return Cast.toStr(Bit.shiftL(1, 1)); }
    if ($sMethod === "Bit.shiftR") { return Cast.toStr(Bit.shiftR(2, 1)); }

    if ($sMethod === "Cast.toStr") { return Cast.toStr(100); }
    if ($sMethod === "Cast.toInt") { return Cast.toStr(Cast.toInt("100")); }
    if ($sMethod === "Cast.toFloat") { return Cast.toStr(Cast.toFloat("100.5")); }

    if ($sMethod === "Regex.match") {
        const $mMatch = Regex.match("^a(b)c$", "abc", "i");
        if (Map.has($mMatch, "matched") && $mMatch["matched"] === true) {
            return "true";
        }
        return "false";
    }
    if ($sMethod === "Regex.replace") { return Regex.replace("a", "x", "abc", ""); }
    if ($sMethod === "Regex.test") { return Cast.toStr(Regex.test("^a", "abc", "")); }

    return "Unknown method";
};