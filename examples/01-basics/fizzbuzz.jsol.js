// @JSOL v0.2.91

/**
 @description
 Classic FizzBuzz: for every integer from 1 to $qLimit, produce "Fizz" if
 divisible by 3, "Buzz" if divisible by 5, "FizzBuzz" if divisible by both,
 or the number itself (as text) otherwise.
  This is one of the oldest exercises for teaching conditional branching and
 the modulo operator: every rule is a simple divisibility check, but the
 order in which you check them matters. Both-divisor must be tested before
 either single-divisor rule, or "FizzBuzz" is never reached (every multiple
 of 15 would already be caught by the "Fizz" branch first).

@param {integer} $qLimit - Upper bound, inclusive. Expected to be >= 1.
@returns {array<string>} - One string per number from 1 to $qLimit, in order.
*/

/**
 @contract
 {
   "cases": [
     { "$qLimit": 15 },
     { "$qLimit": 1 }
   ]
 }
*/

const $aFizzBuzz = function($qLimit) {
    // $aOutput: "a" = Array. Collects one entry per iteration, in order.
    const $aOutput = [];

    for (let $qN = 1; $qN <= $qLimit; $qN = $qN + 1) {
        if ($qN % 15 === 0) {
            Arr.push($aOutput, "FizzBuzz");
        } else if ($qN % 3 === 0) {
            Arr.push($aOutput, "Fizz");
        } else if ($qN % 5 === 0) {
            Arr.push($aOutput, "Buzz");
        } else {
            // Cast.toStr converts the number to text: $aOutput holds strings,
            // and JSOL never casts implicitly.
            Arr.push($aOutput, Cast.toStr($qN));
        }
    }

    return $aOutput;
};
