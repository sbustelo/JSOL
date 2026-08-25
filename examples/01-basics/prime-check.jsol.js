// @JSOL v0.2.91

/**
 @description

 Determines whether $qN is a prime number: an integer greater than 1 with
 no positive divisors other than 1 and itself.
 
 Trial division only needs to test candidate divisors up to the square
 root of $qN. If $qN = a * b with a <= b, then a <= sqrt($qN); every factor
 pair has at least one member at or below the square root, so testing past
 it can never find a divisor the earlier part of the loop would have missed.

@param {integer} $qN - Integer to test. Values below 2 are never prime.
@returns {boolean} - True if $qN is prime, false otherwise.
*/

/**
 @contract
 {
   "cases": [
     { "$qN": 1 },
     { "$qN": 2 },
     { "$qN": 17 },
     { "$qN": 18 }
   ]
 }
*/

const $bIsPrime = function($qN) {
    if ($qN < 2) {
        return false;
    }
    if ($qN === 2) {
        return true;
    }
    if ($qN % 2 === 0) {
        return false;
    }

    // Math.pow($qN, 0.5) is the square root; Math.floor bounds the loop to
    // the integer part of it, per the reasoning above.
    const $qLimit = Math.floor(Math.pow($qN, 0.5));

    // Step by 2: even divisors were already ruled out above.
    for (let $qDivisor = 3; $qDivisor <= $qLimit; $qDivisor = $qDivisor + 2) {
        if ($qN % $qDivisor === 0) {
            return false;
        }
    }

    return true;
};
