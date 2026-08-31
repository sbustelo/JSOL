// @JSOL v0.2.97

/**
 @description
 # v0.2.97 New Features Test Suite

 Validates the Ahead-Of-Time (AOT) Symbol Table expansion, the new string subtypes,
 and the variadic Boolean logic domain.
 
 1. **Symbol Expansion**: Declares variables with prefixes and mutates/accesses them 
    using only their root names, proving the compiler expands them correctly before emission.
 2. **String Subtypes**: Declares $sa (ASCII), $su (Unicode), and $s (Generic) to ensure 
    the compiler parses and routes them correctly across all 4 targets.
 3. **Boolean Domain**: Validates variadic logic evaluations (Bool.and, Bool.or, Bool.xor, etc.).

 @param {string} $sTestName - The feature to test.
 @returns {string} - The stringified result.
*/

/**
 @contract
 {
   "cases": [
     { "$sTestName": "symbol_expansion", "expect": { "_result": "AOT-OK" } },
     { "$sTestName": "string_subtypes", "expect": { "_result": "123-456-xyz" } },
     { "$sTestName": "bool_domain", "expect": { "_result": "BOOL-OK" } }
   ]
 }
*/

const $sTestNewFeatures = function($sTestName) {
    if ($sTestName === "symbol_expansion") {
        let $qCounter = 0;
        let $saMessage = "AOT-";
        let $bFlag = false;

        // Mutar y acceder usando EXCLUSIVAMENTE los root names.
        // Si el compilador falla en expandir la Tabla de Símbolos, estos quedarán 
        // compilados como $counter, $message, $flag y el runtime crasheará por 
        // variable no definida (Undefined variable).
        $counter = 10;
        $message = "AOT-OK";
        $flag = true;

        if ($flag === true && $counter === 10) {
            return $message;
        }
        return "FAIL";
    }

    if ($sTestName === "string_subtypes") {
        let $saAsciiStr = "abc";
        let $suUnicodeStr = "def";
        let $sGenericStr = "xyz";
        
        // Verificar que las variables con tipos de 2 caracteres se expanden 
        // correctamente desde la raíz.
        $asciistr = "123";
        $unicodestr = "456";
        $genericstr = "xyz";
        
        const $aParts = [$asciistr, $unicodestr, $genericstr];
        return Arr.join($aParts, "-");
    }

    if ($sTestName === "bool_domain") {
        let $bT = true;
        let $bF = false;

        // Variadic tests
        let $bResAnd = Bool.and($bT, $bT, $bT); // true
        let $bResOr  = Bool.or($bF, $bF, $bT);  // true
        let $bResXor = Bool.xor($bT, $bF, $bF); // true (cantidad impar de trues = true)
        let $bResNot = Bool.not($bF);           // true
        let $bResEq  = Bool.eq($bT, $bT, $bT);  // true
        let $bResNeq = Bool.neq($bT, $bF);      // true

        if (Bool.and($bResAnd, $bResOr, $bResXor, $bResNot, $bResEq, $bResNeq) === true) {
            return "BOOL-OK";
        }
        return "FAIL";
    }

    return "UNKNOWN";
};