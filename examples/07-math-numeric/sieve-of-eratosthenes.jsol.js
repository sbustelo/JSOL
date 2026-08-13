// @JSOL v0.2.91

/**
 * @description
 * Finds every prime number up to $qLimit (inclusive) using the Sieve of
 * Eratosthenes: start by assuming every number is prime, then for each
 * prime found, mark every multiple of it as not prime. What survives
 * unmarked is exactly the set of primes. Named for Eratosthenes of Cyrene
 * (3rd century BCE), one of the oldest algorithms still in everyday use,
 * and far faster than testing each number individually with trial
 * division (see prime-check.jsol.js in 01-basics for that approach).
 *
 * @param {integer} $qLimit - Upper bound, inclusive.
 * @returns {array<integer>} - Every prime number from 2 up to $qLimit, in order.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$qLimit": 30 },
 *     { "$qLimit": 1 }
 *   ]
 * }
 */

const $aSieveOfEratosthenes = function($qLimit) {
    const $aPrimes = [];
    if ($qLimit < 2) {
        return $aPrimes;
    }

    // $aIsComposite[$i] becomes true once $i is known to have a divisor
    // other than 1 and itself. Starts all false: every number is assumed
    // prime until proven otherwise.
    const $aIsComposite = [];
    for (let $i = 0; $i <= $qLimit; $i = $i + 1) {
        Arr.push($aIsComposite, false);
    }

    for (let $qCandidate = 2; $qCandidate * $qCandidate <= $qLimit; $qCandidate = $qCandidate + 1) {
        if ($aIsComposite[$qCandidate] === false) {
            // Every multiple of $qCandidate starting at its square is
            // composite; smaller multiples were already marked by a
            // smaller prime factor on an earlier pass.
            for (let $qMultiple = $qCandidate * $qCandidate; $qMultiple <= $qLimit; $qMultiple = $qMultiple + $qCandidate) {
                $aIsComposite[$qMultiple] = true;
            }
        }
    }

    for (let $i = 2; $i <= $qLimit; $i = $i + 1) {
        if ($aIsComposite[$i] === false) {
            Arr.push($aPrimes, $i);
        }
    }

    return $aPrimes;
};