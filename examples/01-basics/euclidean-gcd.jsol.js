// @JSOL v0.2.97

/**
 @description
 
 Computes the greatest common divisor (GCD) of two non-negative integers
 using the Euclidean algorithm: gcd(a, b) = gcd(b, a mod b), repeated until
 the remainder reaches 0, at which point the other value is the answer.
 
 One of the oldest algorithms on record (Euclid's Elements, Book VII,
 c. 300 BCE) and still the standard way to compute a GCD: each step
 replaces the pair (a, b) with the strictly smaller pair (b, a mod b), so
 it terminates in a bounded number of steps without enumerating divisors.

- @param {number} $nA - First non-negative integer.
- @param {number} $nB - Second non-negative integer.
- @returns {number} - The greatest common divisor of $nA and $nB.
*/

/**
 @contract
 {
   "cases": [
     { "$nA": 48, "$nB": 18 },
     { "$nA": 17, "$nB": 5 },
     { "$nA": 0, "$nB": 9 }
   ]
 }
*/

const $nGcd = function($nA, $nB) {
    let $nX = $nA;
    let $nY = $nB;

    // JSOL 0.3.0: Se reemplaza la evaluación estricta ($nY !== 0) por desigualdad matemática
    // para evadir la divergencia de tipos de PHP, donde Math.modX puede retornar el float 0.0 
    // y provocar que (0.0 !== 0) evalúe como TRUE, generando un bucle infinito y División por Cero.
    while ($nY > 0) {
        // JSOL 0.3.0: The native % operator is strictly forbidden in Userland due to 
        // sign and float truncation divergences between JS, PHP, and Python.
        // Math.modX implements Excel's deterministic formula: a - b * floor(a / b).
        const $nRemainder = Math.modX($nX, $nY);
        $nX = $nY;
        $nY = $nRemainder;
    }

    return $nX;
};