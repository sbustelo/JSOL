// @JSOL v0.2.91

/**
 @description
 Finds the index of $nTarget in $aSortedValues, which must already be
 sorted in ascending order. Repeatedly checks the middle element of the
 remaining range: if it is too small, the target must be in the right
 half; if too large, the left half; if equal, found. Each check discards
 half of the remaining candidates, so the search space shrinks
 logarithmically instead of linearly.

@param {array<number>} $aSortedValues - Numbers in ascending order.
@param {number} $nTarget - Value to search for.
@returns {integer} - Index of $nTarget in $aSortedValues, or -1 if not found.
*/

/**
 @contract
 {
   "cases": [
     { "$aSortedValues": [1, 3, 5, 7, 9, 11], "$nTarget": 7 },
     { "$aSortedValues": [1, 3, 5, 7, 9, 11], "$nTarget": 4 },
     { "$aSortedValues": [], "$nTarget": 1 }
   ]
 }
*/

const $qBinarySearch = function($aSortedValues, $nTarget) {
    let $qLow = 0;
    let $qHigh = Arr.len($aSortedValues) - 1;

    while ($qLow <= $qHigh) {
        // Written as low + (high-low)/2 rather than (low+high)/2 to avoid
        // integer overflow on very large indices in languages with fixed
        // integer width; harmless here, but it is the textbook-correct form.
        const $qMid = $qLow + Math.floor(($qHigh - $qLow) / 2);
        const $nMidValue = $aSortedValues[$qMid];

        if ($nMidValue === $nTarget) {
            return $qMid;
        }
        if ($nMidValue < $nTarget) {
            $qLow = $qMid + 1;
        } else {
            $qHigh = $qMid - 1;
        }
    }

    return -1;
};
