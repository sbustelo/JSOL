// @JSOL v0.2.91

/**
 * @description
 * Sorts an array of numbers into ascending order using quicksort (CLRS
 * chapter 7) with the Lomuto partition scheme: pick the last element of
 * the current range as the pivot, rearrange the range so everything
 * smaller than the pivot ends up to its left and everything larger ends
 * up to its right, then recursively sort each side. Unlike
 * merge-sort.jsol.js, quicksort partitions in place, no extra array is
 * needed for merging.
 *
 * O(n log n) on average, but O(n^2) in the worst case (e.g. an already
 * sorted array, with this particular pivot choice) — the classic
 * trade-off CLRS discusses alongside quicksort: average-case speed at the
 * cost of a data-dependent worst case that merge sort does not have.
 *
 * @param {array<number>} $aValues - Numbers to sort.
 * @returns {array<number>} - A new array with the same numbers in ascending order.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$aValues": [5, 2, 9, 1, 5, 6] },
 *     { "$aValues": [] }
 *   ]
 * }
 */

const $qPartition = function($aValues, $qLow, $qHigh) {
    const $nPivot = $aValues[$qHigh];
    let $qBoundary = $qLow - 1;

    for (let $qI = $qLow; $qI < $qHigh; $qI = $qI + 1) {
        if ($aValues[$qI] <= $nPivot) {
            $qBoundary = $qBoundary + 1;
            const $nTemp = $aValues[$qBoundary];
            $aValues[$qBoundary] = $aValues[$qI];
            $aValues[$qI] = $nTemp;
        }
    }

    // Place the pivot right after the last element known to be smaller
    // than it: everything to its left is now <= pivot, everything to its
    // right is > pivot.
    const $nTemp = $aValues[$qBoundary + 1];
    $aValues[$qBoundary + 1] = $aValues[$qHigh];
    $aValues[$qHigh] = $nTemp;

    return $qBoundary + 1;
};

const $aQuickSortRange = function($aValues, $qLow, $qHigh) {
    if ($qLow < $qHigh) {
        const $qPivotIndex = $qPartition($aValues, $qLow, $qHigh);
        $aQuickSortRange($aValues, $qLow, $qPivotIndex - 1);
        $aQuickSortRange($aValues, $qPivotIndex + 1, $qHigh);
    }
    return $aValues;
};

const $aQuickSort = function($aValues) {
    const $aSorted = Arr.slice($aValues, 0, Arr.count($aValues));
    const $qLen = Arr.count($aSorted);

    if ($qLen > 1) {
        $aQuickSortRange($aSorted, 0, $qLen - 1);
    }

    return $aSorted;
};
