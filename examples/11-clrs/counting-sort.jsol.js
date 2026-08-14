// @JSOL v0.2.91

/**
 * @description
 * Sorts an array of non-negative integers into ascending order using
 * counting sort (CLRS chapter 8): counts how many times each value from 0
 * to $qMaxValue appears, then reconstructs the sorted output directly from
 * those counts. Never compares two elements to each other, which is how
 * it beats the O(n log n) lower bound that applies to any comparison-based
 * sort (merge-sort.jsol.js, quick-sort.jsol.js, heap-sort.jsol.js):
 * counting sort is O(n + k), where k is $qMaxValue.
 *
 * This only works because the values are known to be non-negative
 * integers within a bounded, reasonably small range; it does not
 * generalize to arbitrary comparable values the way the comparison-based
 * sorts do.
 *
 * @param {array<integer>} $aValues - Non-negative integers to sort.
 * @param {integer} $qMaxValue - The largest possible value that can appear in $aValues.
 * @returns {array<integer>} - A new array with the same numbers in ascending order.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$aValues": [4, 2, 2, 8, 3, 3, 1], "$qMaxValue": 8 }
 *   ]
 * }
 */

const $aCountingSort = function($aValues, $qMaxValue) {
    // One counter per possible value, from 0 to $qMaxValue.
    const $aCounts = [];
    for (let $i = 0; $i <= $qMaxValue; $i = $i + 1) {
        Arr.push($aCounts, 0);
    }

    const $qLen = Arr.count($aValues);
    for (let $i = 0; $i < $qLen; $i = $i + 1) {
        const $qValue = $aValues[$i];
        $aCounts[$qValue] = $aCounts[$qValue] + 1;
    }

    // Walk the counts in order, emitting each value as many times as it
    // was counted.
    const $aSorted = [];
    for (let $qValue = 0; $qValue <= $qMaxValue; $qValue = $qValue + 1) {
        let $qOccurrences = $aCounts[$qValue];
        while ($qOccurrences > 0) {
            Arr.push($aSorted, $qValue);
            $qOccurrences = $qOccurrences - 1;
        }
    }

    return $aSorted;
};
