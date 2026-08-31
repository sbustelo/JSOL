// @JSOL v0.2.91

/**
 @description
 Finds the index of $nTarget in $aValues by checking every element in
 order until a match is found. Unlike binary-search.jsol.js, this works on
 any array regardless of whether it is sorted, at the cost of checking up
 to every element instead of discarding half the candidates each step.

@param {array<number>} $aValues - Numbers to search, in any order.
@param {number} $nTarget - Value to search for.
@returns {integer} - Index of the first match, or -1 if not found.
*/

/**
 @contract
 {
   "cases": [
     { "$aValues": [4, 8, 15, 16, 23, 42], "$nTarget": 16 },
     { "$aValues": [4, 8, 15, 16, 23, 42], "$nTarget": 99 }
   ]
 }
*/

const $qLinearSearch = function($aValues, $nTarget) {
    const $qLen = Arr.len($aValues);

    for (let $i = 0; $i < $qLen; $i = $i + 1) {
        if ($aValues[$i] === $nTarget) {
            return $i;
        }
    }

    return -1;
};
