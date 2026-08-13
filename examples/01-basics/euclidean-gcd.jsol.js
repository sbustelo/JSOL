// @JSOL v0.2.91

/**
 * @description
 * Computes the greatest common divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm: gcd(a, b) = gcd(b, a mod b), repeated until
 * the remainder reaches 0, at which point the other value is the answer.
 *
 * One of the oldest algorithms on record (Euclid's Elements, Book VII,
 * c. 300 BCE) and still the standard way to compute a GCD: each step
 * replaces the pair (a, b) with the strictly smaller pair (b, a mod b), so
 * it terminates in a bounded number of steps without enumerating divisors.
 *
 * @param {integer} $qA - First non-negative integer.
 * @param {integer} $qB - Second non-negative integer.
 * @returns {integer} - The greatest common divisor of $qA and $qB.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$qA": 48, "$qB": 18 },
 *     { "$qA": 17, "$qB": 5 },
 *     { "$qA": 0, "$qB": 9 }
 *   ]
 * }
 */

const $qGcd = function($qA, $qB) {
    let $qX = $qA;
    let $qY = $qB;

    while ($qY !== 0) {
        const $qRemainder = $qX % $qY;
        $qX = $qY;
        $qY = $qRemainder;
    }

    return $qX;
};
