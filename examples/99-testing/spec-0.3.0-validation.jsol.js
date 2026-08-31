// @JSOL v0.2.97

/**
 @description
 # JSOL Spec 0.3.0 Full Validation Suite
 
 Valida la completitud de la implementación de la especificación 0.3.0 en la 
 versión de transición 0.2.97. 
 
 Prueba de forma isomórfica:
 1. Dominio Math (Criterio Excel, operaciones variádicas).
 2. Dominio Bool (Operaciones lógicas variádicas).
 3. Dominio Str & Arr (Manejo de colecciones).
 4. Canal de Sombras (Validación de fallos out-of-band sin romper el runtime).

 @param {string} $sDomain - El dominio o feature a testear.
 @returns {string} - El código de resultado o error detectado en el Shadow Channel.
*/

/**
 @contract
 {
   "cases": [
     { "in": { "$sDomain": "math_excel" }, "expect": { "_result": "OK" } },
     { "in": { "$sDomain": "bool_variadic" }, "expect": { "_result": "OK" } },
     { "in": { "$sDomain": "shadow_divide_by_zero" }, "expect": { "_result": "DIVIDE_BY_ZERO" } },
     { "in": { "$sDomain": "shadow_parse_error" }, "expect": { "_result": "PARSE_ERROR" } },
     { "in": { "$sDomain": "shadow_not_found" }, "expect": { "_result": "NOT_FOUND" } },
     { "in": { "$sDomain": "shadow_empty_array" }, "expect": { "_result": "EMPTY_ARRAY" } },
     { "in": { "$sDomain": "shadow_key_not_found" }, "expect": { "_result": "KEY_NOT_FOUND" } }
   ]
 }
*/

const $sValidateSpec030 = function($sDomain) {

    // 1. CRITERIO EXCEL & MATEMÁTICA VARIÁDICA
    if ($sDomain === "math_excel") {
        // modX: Signo sigue al divisor (Excel)
        if (Math.modX(-10, 3) !== 2) { return "FAIL_MODX_1"; }
        if (Math.modX(10, -3) !== -2) { return "FAIL_MODX_2"; }
        
        // roundX: Half away from zero (Excel)
        if (Math.roundX(1.5) !== 2) { return "FAIL_ROUNDX_1"; }
        if (Math.roundX(-1.5) !== -2) { return "FAIL_ROUNDX_2"; }
        
        // Variadic Math
        if (Math.sum(10, 20, 5) !== 35) { return "FAIL_SUM"; }
        if (Math.sub(100, 20, 5) !== 75) { return "FAIL_SUB"; } // (100 - 20) - 5
        if (Math.mul(2, 3, 4) !== 24) { return "FAIL_MUL"; }
        if (Math.div(100, 2, 5) !== 10) { return "FAIL_DIV"; } // (100 / 2) / 5
        
        return "OK";
    }

    // 2. LÓGICA BOOLEANA VARIÁDICA
    if ($sDomain === "bool_variadic") {
        let $bT = true;
        let $bF = false;

        if (Bool.and($bT, $bT, $bT) !== true) { return "FAIL_AND"; }
        if (Bool.or($bF, $bF, $bT) !== true) { return "FAIL_OR"; }
        // XOR: Paridad impar (3 verdades = true)
        if (Bool.xor($bT, $bT, $bT) !== true) { return "FAIL_XOR"; }
        if (Bool.not($bF) !== true) { return "FAIL_NOT"; }
        
        return "OK";
    }

    // 3. CANAL DE SOMBRAS (SHADOW CHANNEL OUT-OF-BAND TESTING)
    if ($sDomain === "shadow_divide_by_zero") {
        JSOL.resetShadow();
        let $nResult = Math.div(100, 0, 5); // Falla en el primer divisor
        if (JSOL.ok() === false) { return "DIVIDE_BY_ZERO"; }
        return "FAIL";
    }

    if ($sDomain === "shadow_parse_error") {
        JSOL.resetShadow();
        let $nResult = Cast.toInt("basura_no_numerica");
        if (JSOL.ok() === false) { return "PARSE_ERROR"; }
        return "FAIL";
    }

    if ($sDomain === "shadow_not_found") {
        JSOL.resetShadow();
        let $iPos = Str.indexOf("hello world", "xyz");
        if (JSOL.ok() === false) { return "NOT_FOUND"; }
        return "FAIL";
    }

    if ($sDomain === "shadow_empty_array") {
        JSOL.resetShadow();
        let $aEmpty = [];
        let $val = Arr.pop($aEmpty);
        if (JSOL.ok() === false) { return "EMPTY_ARRAY"; }
        return "FAIL";
    }

    if ($sDomain === "shadow_key_not_found") {
        JSOL.resetShadow();
        let $mDict = Map.create("clave", "valor");
        let $val = Map.get($mDict, "clave_inexistente");
        if (JSOL.ok() === false) { return "KEY_NOT_FOUND"; }
        return "FAIL";
    }

    return "UNKNOWN_DOMAIN";
};