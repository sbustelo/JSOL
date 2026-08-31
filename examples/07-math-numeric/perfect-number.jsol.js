// @JSOL v0.2.97

/**
 @description
 Checks whether $nN is a perfect number: a positive integer equal to the
 sum of its own proper divisors (every divisor except itself). 6 is the
 smallest example: its proper divisors are 1, 2, and 3, and 1+2+3=6.
 Studied since Euclid's Elements, still a standard example for teaching
 divisor enumeration.

@param {number} $nN - Positive integer to test.
@returns {boolean} - True if $nN is a perfect number.
*/

/**
 @contract
 {
   "cases": [
     { "$nN": 6 },
     { "$nN": 28 },
     { "$nN": 12 }
   ]
 }
*/

const $bIsPerfectNumber = function($nN) {
    if ($nN < 2) {
        return false;
    }

    // Only divisors up to $nN / 2 need checking: nothing strictly between
    // $nN/2 and $nN can divide $nN evenly other than $nN itself.
    let $nSumOfDivisors = 0;
    for (let $nDivisor = 1; $nDivisor <= $nN / 2; $nDivisor = $nDivisor + 1) {
        // JSOL 0.3.0: Replaced % with Math.modX.
        if (Math.modX($nN, $nDivisor) === 0) {
            $nSumOfDivisors = $nSumOfDivisors + $nDivisor;
        }
    }

    return $nSumOfDivisors === $nN;
};