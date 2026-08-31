// @JSOL v0.2.97

/**
 @description

 # Core Primitives Test Suite - Switch Pattern
 
 A complete validation suite that tests every primitive domain method specified in **JSOL v0.3**.
 Designed using a **STRICT SWITCH routing pattern** to specifically stress-test the compiler's 
 support for `switch` statements without fallthrough. Each method is evaluated in isolation 
 as a separate row in the **JSOL REPL Interpreter**, preventing a single unimplemented function 
 from crashing the entire test suite.

 ## Key Design Decisions

 - **Strict Switch Pattern**: Specifically tests compiler support for switch without fallthrough
 - **Isolation**: Each method runs independently to prevent cascade failures
 - **Complementary Testing**: IF-ELSE version available in `.ifs.jsol.js`

 ## Parameters

 - **@param {string} $sMethod** - The name of the method to evaluate.

 ## Returns

 - **@returns {string}** - The stringified result of the evaluation.

 


 ## Test Cases

 The following methods are tested across all primitive domains:

 ### String Methods
 - `Str.len`
 - `Str.sub`
 - `Str.indexOf`
 - `Str.replaceAll`
 - `Str.char`
 - `Str.fromChar`
 - `Str.upper`
 - `Str.lower`
 - `Str.split`

 ### Array Methods
 - `Arr.len`
 - `Arr.push`
 - `Arr.pop`
 - `Arr.shift`
 - `Arr.slice`
 - `Arr.indexOf`
 - `Arr.join`

 ### Map Methods
 - `Map.create`
 - `Map.has`
 - `Map.keys`

 ### Math Methods
 - `Math.floor`
 - `Math.abs`
 - `Math.pow`
 - `Math.min`
 - `Math.max`
 - `Math.roundX`

 ### Bitwise Methods
 - `Bit.and`
 - `Bit.or`
 - `Bit.xor`
 - `Bit.not`
 - `Bit.shiftL`
 - `Bit.shiftR`

 ### Casting Methods
 - `Cast.toStr`
 - `Cast.toInt`
 - `Cast.toFloat`

 ### Regex Methods
 - `Regex.match`
 - `Regex.replace`
 - `Regex.test`
 */

/**
 @contract
 {
   "cases": [
     { "$sMethod": "Str.len" },
     { "$sMethod": "Str.sub" },
     { "$sMethod": "Str.indexOf" },
     { "$sMethod": "Str.replaceAll" },
     { "$sMethod": "Str.char" },
     { "$sMethod": "Str.fromChar" },
     { "$sMethod": "Str.upper" },
     { "$sMethod": "Str.lower" },
     { "$sMethod": "Str.split" },
     { "$sMethod": "Arr.len" },
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
     
	 { "$sMethod": "Math.roundX" },
     { "$sMethod": "Math.eq" },
     { "$sMethod": "Math.neq" },
     { "$sMethod": "Math.gt" },
     { "$sMethod": "Math.lt" },
     { "$sMethod": "Math.gte" },
     { "$sMethod": "Math.lte" },

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

/**
Out of contract 0.2.97 
     // { "$sMethod": "Math.min" },
     // { "$sMethod": "Math.max" },} $sMethod 
 */

const $sTestPrimitive = function($sMethod) {
    switch ($sMethod) {
        case "Str.len": return Cast.toStr(Str.len("abc"));
        case "Str.sub": return Str.sub("abc", 1, 1);
        case "Str.indexOf": return Cast.toStr(Str.indexOf("abc", "b"));
        // JSOL 0.3.0: Str.replaceAll replaces the deprecated Str.replace.
        case "Str.replaceAll": return Str.replaceAll("abc", "b", "x");
        case "Str.char": return Cast.toStr(Str.char("abc", 0));
        case "Str.fromChar": return Str.fromChar(97);
        case "Str.upper": return Str.upper("abc");
        case "Str.lower": return Str.lower("ABC");
        case "Str.split": {
            const $aSplit = Str.split("a,b", ",");
            return Arr.join($aSplit, "-");
        }

        // JSOL 0.3.0: Arr.len replaces Arr.count.
        case "Arr.len": return Cast.toStr(Arr.len(["x", "y"]));
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
        // case "Math.min": return Cast.toStr(Math.min(10, 2));
        // case "Math.max": return Cast.toStr(Math.max(10, 2));

// JSOL 0.3.0: Math.roundX replaces Math.round.
        case "Math.roundX": return Cast.toStr(Math.roundX(1.5));

        // TS Parity: Operar sobre variables para eludir el Error TS2367.
        case "Math.eq": { const $nA = 5; const $nB = 5; return Cast.toStr(Math.eq($nA, $nB)); }
        case "Math.neq": { const $nA = 5; const $nB = 3; return Cast.toStr(Math.neq($nA, $nB)); }
        case "Math.gt": { const $nA = 5; const $nB = 3; return Cast.toStr(Math.gt($nA, $nB)); }
        case "Math.lt": { const $nA = 3; const $nB = 5; return Cast.toStr(Math.lt($nA, $nB)); }
        case "Math.gte": { const $nA = 5; const $nB = 5; return Cast.toStr(Math.gte($nA, $nB)); }
        case "Math.lte": { const $nA = 5; const $nB = 5; return Cast.toStr(Math.lte($nA, $nB)); }

        case "Bit.and": return Cast.toStr(Bit.and(3, 1));

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