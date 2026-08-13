// @JSOL v0.2.91

/**
 * @description
 * Checks whether $qN is a perfect number: a positive integer equal to the
 * sum of its own proper divisors (every divisor except itself). 6 is the
 * smallest example: its proper divisors are 1, 2, and 3, and 1+2+3=6.
 * Studied since Euclid's Elements, still a standard example for teaching
 * divisor enumeration.
 *
 * @param {integer} $qN - Positive integer to test.
 * @returns {boolean} - True if $qN is a perfect number.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$qN": 6 },
 *     { "$qN": 28 },
 *     { "$qN": 12 }
 *   ]
 * }
 */

const $bIsPerfectNumber = function($qN) {
    if ($qN < 2) {
        return false;
    }

    // Only divisors up to $qN / 2 need checking: nothing strictly between
    // $qN/2 and $qN can divide $qN evenly other than $qN itself.
    let $qSumOfDivisors = 0;
    for (let $qDivisor = 1; $qDivisor <= $qN / 2; $qDivisor = $qDivisor + 1) {
        if ($qN % $qDivisor === 0) {
            $qSumOfDivisors = $qSumOfDivisors + $qDivisor;
        }
    }

    return $qSumOfDivisors === $qN;
};