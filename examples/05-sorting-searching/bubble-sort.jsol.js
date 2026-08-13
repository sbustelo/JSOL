// @JSOL v0.2.91

/**
 * @description
 * Sorts an array of numbers into ascending order using bubble sort: repeated
 * passes over the array, swapping every adjacent pair that is out of order,
 * until a full pass makes no swaps at all. Each pass "bubbles" the largest
 * remaining unsorted value to its correct position at the end, so the
 * unsorted region shrinks by one from the right after every pass.
 *
 * O(n^2) in the worst and average case, but O(n) if the array is already
 * sorted, because $bSwapped stays false and the loop exits after one pass.
 *
 * @param {array<number>} $aValues - Numbers to sort.
 * @returns {array<number>} - A new array with the same numbers in ascending order.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$aValues": [5, 2, 9, 1, 5, 6] },
 *     { "$aValues": [1, 2, 3] },
 *     { "$aValues": [] }
 *   ]
 * }
 */

const $aBubbleSort = function($aValues) {
    // Work on a copy: the input array is not mutated. Arr.slice over the
    // full range is how a shallow copy is made, JSOL has no dedicated
    // Arr.copy.
    const $aSorted = Arr.slice($aValues, 0, Arr.count($aValues));
    const $qLen = Arr.count($aSorted);

    let $bSwapped = true;
    while ($bSwapped === true) {
        $bSwapped = false;

        for (let $i = 0; $i < $qLen - 1; $i = $i + 1) {
            if ($aSorted[$i] > $aSorted[$i + 1]) {
                const $nTemp = $aSorted[$i];
                $aSorted[$i] = $aSorted[$i + 1];
                $aSorted[$i + 1] = $nTemp;
                $bSwapped = true;
            }
        }
    }

    return $aSorted;
};
