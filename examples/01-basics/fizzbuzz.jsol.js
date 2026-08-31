// @JSOL v0.2.97

/**
 @description
 
 # Classic FizzBuzz #
 
 For every integer from 1 to $nLimit, produce "Fizz" if
 divisible by 3, "Buzz" if divisible by 5, "FizzBuzz" if divisible by both,
 or the number itself (as text) otherwise.

This is one of the oldest exercises for teaching conditional branching and
 the modulo operator: every rule is a simple divisibility check, but the
 order in which you check them matters. Both-divisor must be tested before
 either single-divisor rule, or "FizzBuzz" is never reached (every multiple
 of 15 would already be caught by the "Fizz" branch first).

- @param {number} $nLimit - Upper bound, inclusive. Expected to be >= 1.
- @returns {array<string>} - One string per number from 1 to $nLimit, in order.
*/

/**
 @contract
 {
   "cases": [
     { "$nLimit": 15 },
     { "$nLimit": 1 }
   ]
 }
*/

const $aFizzBuzz = function($nLimit) {
    // $aOutput: "a" = Array. Collects one entry per iteration, in order.
    const $aOutput = [];

    for (let $nN = 1; $nN <= $nLimit; $nN = $nN + 1) {
        // JSOL 0.3.0: % is replaced with Math.modX to guarantee identical 
        // divisibility evaluation across JavaScript, PHP, Python, and C.
        if (Math.modX($nN, 15) === 0) {
            Arr.push($aOutput, "FizzBuzz");
        } else if (Math.modX($nN, 3) === 0) {
            Arr.push($aOutput, "Fizz");
        } else if (Math.modX($nN, 5) === 0) {
            Arr.push($aOutput, "Buzz");
        } else {
            // Cast.toStr converts the number to text: $aOutput holds strings,
            // and JSOL never casts implicitly.
            Arr.push($aOutput, Cast.toStr($nN));
        }
    }

    return $aOutput;
};