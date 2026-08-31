// @JSOL v0.2.97

/**
 @description

 # Determinismo Isomórfico: Tabla de Paridad Semántica
 
 Este ejemplo calcula en JSOL una serie de expresiones que históricamente
 generan resultados divergentes o errores fatales dependiendo del lenguaje host
 (JavaScript, PHP o Python). JSOL impone una única semántica predecible,
 documentada y transversal.
 
 | Caso | JavaScript | PHP | Python |
 | --- | --- | --- | --- |
 | `7.5 % 2` | `1.5` | `1` | `1.5` |
 | `Math.round(2.5)` | `3` | `3` | `2` |
 | `Math.round(-2.5)` | `-2` | `-3` | `-2` |
 | `"😀".length` | `2` | `4` | `1` |
 | `"10" < "9"` | `true` | `false` | `true` |
 | `[10, 1, 2].sort()` | `[1, 10, 2]` | `[1, 2, 10]` | `[1, 2, 10]` |
 | `"abc".split("")` | `["a","b","c"]` | `["a","b","c"]` | `ValueError` |
 | `"a" \|\| "b"` | `"a"` | `true` | `"a"` |
 | `String(true)` | `"true"` | `"1"` | `"True"` |
 | `String(false)` | `"false"` | `""` | `"False"` |
 | `json_encode(NaN)` | `"null"` | `false` | `NaN` |
 | `min(NaN, 5)` | `NaN` | `5` | `nan` |
 | `[].pop()` | `undefined` | `null` | `IndexError` |
 | `""` como número | `0` | `0` | `ValueError` |
 | `"12abc"` como entero | `12` | `12` | `ValueError` |
 | `0.1 + 0.2` | `0.30000000000000004` | `0.3` (display) | `0.30000000000000004` |

*/

/**
 @contract
 {
   "cases": [
	{ "$sExpression": "7.5 % 2" },
	{ "$sExpression": "7 % 3" },
	{ "$sExpression": "7 % -3" },
	{ "$sExpression": "-7 % 3" },
	{ "$sExpression": "-7 % -3" },
     { "$sExpression": "Math.round(2.5)" },
     { "$sExpression": "Math.round(-2.5)" },
     { "$sExpression": "😀.length" },
     { "$sExpression": "10 < 9" },
     { "$sExpression": "[10, 1, 2].sort()" },
     { "$sExpression": "abc.split()" },
     { "$sExpression": "a || b" },
     { "$sExpression": "String(true)" },
     { "$sExpression": "String(false)" },
     { "$sExpression": "[].pop()" },
     { "$sExpression": "empty as number" },
     { "$sExpression": "12abc as int" },
     { "$sExpression": "0.1 + 0.2" }
   ]
 }
*/

const $sSemanticParity = function($sExpression) {
    if ($sExpression === "7.5 % 2") {
        // JSOL Math.modX implementa una fórmula cerrada determinista (Excel).
        return Cast.toStr(Math.modX(7.5, 2));
    }
    if ($sExpression === "Math.round(2.5)") {
        // Math.roundX garantiza redondeo "Half Away From Zero".
        return Cast.toStr(Math.roundX(2.5));
    }
    if ($sExpression === "Math.round(-2.5)") {
        return Cast.toStr(Math.roundX(-2.5));
    }
    if ($sExpression === "😀.length") {
        // Str.len cuenta Code Points Reales (1), evadiendo los Code Units (2) de V8.
        return Cast.toStr(Str.len("😀"));
    }
    if ($sExpression === "10 < 9") {
        // JSOL prohíbe comparaciones implícitas en strings. Las fuerzas a int
        // resuelven la ambigüedad nativa produciendo un 'false' predecible.
        return Cast.toStr(Math.lt(Cast.toInt("10"), Cast.toInt("9")));
    }
if ($sExpression === "[10, 1, 2].sort()") {
        // Arr.sort requiere explícitamente un comparador numérico para evadir 
        // el ordenamiento lexicográfico de JS. Se declara en una constante previa
        // para que el parser de Python pueda transpilarlo como una función 'def'.
        const $fCmp = function($nA, $nB) {
            return $nA - $nB;
        };
        const $aList = [10, 1, 2];
        const $aRes = Arr.sort($aList, $fCmp);
        return Arr.join($aRes, ", ");
    }
    if ($sExpression === "abc.split()") {
        // Separa consistentemente en array sin levantar el ValueError de Python.
        return Arr.join(Str.split("abc", ""), ",");
    }
    if ($sExpression === "a || b") {
        // Bool.or exige evaluación booleana estricta, evadiendo truthiness cruzado.
        return Cast.toStr(Bool.or(Cast.toBool("a"), Cast.toBool("b")));
    }
    if ($sExpression === "String(true)") {
        // Cast.toStr unifica a "true" en minúsculas en todos los targets.
        return Cast.toStr(true);
    }
    if ($sExpression === "String(false)") {
        // Unifica a "false" para evadir el string vacío ('') nativo de PHP.
        return Cast.toStr(false);
    }
    if ($sExpression === "[].pop()") {
        // Extracción segura que devuelve null y asienta EMPTY_ARRAY en la sombra
        // en lugar de reventar el intérprete de Python (IndexError).
        const $aEmpty = [];
        return Cast.toStr(Arr.pop($aEmpty));
    }
    if ($sExpression === "empty as number") {
        // Casteo estricto; devuelve 0 asertando PARSE_ERROR (seguro contra Python).
        return Cast.toStr(Cast.toInt(""));
    }
    if ($sExpression === "12abc as int") {
        // Casteo sucio rechazado. Devuelve 0 asertando PARSE_ERROR.
        return Cast.toStr(Cast.toInt("12abc"));
    }
    if ($sExpression === "0.1 + 0.2") {
        // Exhibe la paridad exacta flotante IEEE 754 de la mantisa.
        return Cast.toStr(0.1 + 0.2);
    }

    // FALLBACK HÍBRIDO (Sandbox JIT para la REPL Frontend)
    // Permite testear cualquier expresión al vuelo (ej: "Math.min(NaN, 1)").
    // En las validaciones automatizadas (AOT), PHP y PY devuelven [EVAL_UNAVAILABLE_IN_AOT_MODE].
    return Cast.toStr(JSOL.eval($sExpression));
};