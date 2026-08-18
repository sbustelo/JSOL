// @JSOL v0.2.91

/**
 @description
 Counts how many steps the Collatz sequence takes to reach 1, starting
 from $qN: if the current value is even, divide it by 2; if odd,
 multiply by 3 and add 1; repeat until it reaches 1. Conjectured, but
 never proven, to always reach 1 for any positive starting value. This
 simple rule produces sequences of wildly unpredictable length, which is
 exactly what makes it a famous open problem in mathematics.

@param {integer} $qN - Positive integer to start from.
@returns {integer} - Number of steps taken to reach 1.
*/

/**
 @contract
 {
   "cases": [
     { "$qN": 27 },
     { "$qN": 1 }
   ]
 }
*/

const $qCollatzSteps = function($qN) {
    let $qCurrent = $qN;
    let $qSteps = 0;

    while ($qCurrent !== 1) {
        if ($qCurrent % 2 === 0) {
            $qCurrent = $qCurrent / 2;
        } else {
            $qCurrent = (3 * $qCurrent) + 1;
        }
        $qSteps = $qSteps + 1;
    }

    return $qSteps;
};