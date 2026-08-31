// @JSOL v0.2.97

/**
 @description

 Determines whether $nN is a prime number: an integer greater than 1 with
 no positive divisors other than 1 and itself.
 
 Trial division only needs to test candidate divisors up to the square
 root of $nN. If $nN = a * b with a <= b, then a <= sqrt($nN); every factor
 pair has at least one member at or below the square root, so testing past
 it can never find a divisor the earlier part of the loop would have missed.

@param {number} $nN - Integer to test. Values below 2 are never prime.
@returns {boolean} - True if $nN is prime, false otherwise.
*/

/**
 @contract
 {
   "cases": [
     { "$nN": 1 },
     { "$nN": 2 },
     { "$nN": 17 },
     { "$nN": 18 }
   ]
 }
*/

const $bIsPrime = function($nN) {
    if ($nN < 2) {
        return false;
    }
    if ($nN === 2) {
        return true;
    }
    // JSOL 0.3.0: Replaced % with Math.modX for isomorphic modulo calculation.
    if (Math.modX($nN, 2) === 0) {
        return false;
    }

    // Math.pow($nN, 0.5) is the square root; Math.floor bounds the loop to
    // the integer part of it, per the reasoning above.
    const $nLimit = Math.floor(Math.pow($nN, 0.5));

    // Step by 2: even divisors were already ruled out above.
    for (let $nDivisor = 3; $nDivisor <= $nLimit; $nDivisor = $nDivisor + 2) {
        if (Math.modX($nN, $nDivisor) === 0) {
            return false;
        }
    }

    return true;
};