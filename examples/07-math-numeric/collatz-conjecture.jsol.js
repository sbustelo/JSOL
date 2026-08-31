// @JSOL v0.2.97

/**
 @description
 Counts how many steps the Collatz sequence takes to reach 1, starting
 from $nN: if the current value is even, divide it by 2; if odd,
 multiply by 3 and add 1; repeat until it reaches 1. Conjectured, but
 never proven, to always reach 1 for any positive starting value. This
 simple rule produces sequences of wildly unpredictable length, which is
 exactly what makes it a famous open problem in mathematics.

@param {number} $nN - Positive integer to start from.
@returns {number} - Number of steps taken to reach 1.
*/

/**
 @contract
 {
   "cases": [
     { "$nN": 27 },
     { "$nN": 1 }
   ]
 }
*/

const $nCollatzSteps = function($nN) {
    let $nCurrent = $nN;
    let $nSteps = 0;

    while ($nCurrent !== 1) {
        // JSOL 0.3.0: Uses Math.modX instead of % 2.
        if (Math.modX($nCurrent, 2) === 0) {
            $nCurrent = $nCurrent / 2;
        } else {
            $nCurrent = (3 * $nCurrent) + 1;
        }
        $nSteps = $nSteps + 1;
    }

    return $nSteps;
};