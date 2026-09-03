// @JSOL v0.2.97

/**
 @description
 Rosetta Code task: https://rosettacode.org/wiki/Counting_sort — the
 task's counting sort is defined over a general min..max range of
 values, not a range fixed at 0, so this version takes both bounds and
 also handles arrays containing negative numbers.

 Sorts an array of integers into ascending order using counting sort
 (CLRS chapter 8): counts how many times each value from `$qMinValue` to
 `$qMaxValue` appears, then reconstructs the sorted output directly from
 those counts. Never compares two elements to each other, which is how
 it beats the O(n log n) lower bound that applies to any comparison-based
 sort: counting sort is O(n + k), where k is the size of the
 `$qMinValue..$qMaxValue` range.

 This only works because every value in `$aValues` is known to lie
 within a bounded, reasonably small range; it does not generalize to
 arbitrary comparable values the way a comparison-based sort does.

@param {array<integer>} $aValues - Integers to sort, each within
   [$qMinValue, $qMaxValue].
@param {integer} $qMinValue - The smallest possible value that can
   appear in $aValues.
@param {integer} $qMaxValue - The largest possible value that can appear
   in $aValues.
@returns {array<integer>} - A new array with the same numbers in
   ascending order.
*/

/**
 @contract
 {
   "cases": [
     { "$aValues": [4, 2, 2, 8, 3, 3, 1], "$qMinValue": 0, "$qMaxValue": 8 },
     { "$aValues": [-3, 5, -1, 0, -3, 2], "$qMinValue": -3, "$qMaxValue": 5 }
   ]
 }
*/

const $aCountingSort = function($aValues, $qMinValue, $qMaxValue) {
    const $qRange = $qMaxValue - $qMinValue + 1;

    // One counter per possible value, shifted so index 0 represents
    // $qMinValue.
    const $aCounts = [];
    for (let $i = 0; $i < $qRange; $i = $i + 1) {
        Arr.push($aCounts, 0);
    }

    const $qLen = Arr.len($aValues);
    for (let $i = 0; $i < $qLen; $i = $i + 1) {
        const $qSlot = $aValues[$i] - $qMinValue;
        $aCounts[$qSlot] = $aCounts[$qSlot] + 1;
    }

    // Walk the counts in order, emitting each value (shifted back by
    // $qMinValue) as many times as it was counted.
    const $aSorted = [];
    for (let $qSlot = 0; $qSlot < $qRange; $qSlot = $qSlot + 1) {
        let $qOccurrences = $aCounts[$qSlot];
        while ($qOccurrences > 0) {
            Arr.push($aSorted, $qSlot + $qMinValue);
            $qOccurrences = $qOccurrences - 1;
        }
    }

    return $aSorted;
};
