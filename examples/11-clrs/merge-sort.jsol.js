// @JSOL v0.2.97

/**
 @description
 Sorts an array of numbers into ascending order using merge sort (CLRS
 chapter 2): split the array in half, recursively sort each half, then
 merge the two sorted halves back together in a single linear pass. The
 merge step does the actual work; since each half arrives already
 sorted, merging just means repeatedly taking the smaller of the two
 current front elements.
  O(n log n) in every case, unlike bubble-sort.jsol.js or
 insertion-sort.jsol.js (05-sorting-searching), which degrade to O(n^2)
 on unfavorable input. The trade-off is space: merge sort needs O(n)
 extra memory for the merged output, where those two sort in place.

@param {array<number>} $aValues - Numbers to sort.
@returns {array<number>} - A new array with the same numbers in ascending order.
*/

/**
 @contract
 {
   "cases": [
     { "$aValues": [5, 2, 9, 1, 5, 6] },
     { "$aValues": [1] },
     { "$aValues": [] }
   ]
 }
*/

const $aMergeSortedHalves = function($aLeft, $aRight) {
    const $aMerged = [];
    const $qLeftLen = Arr.len($aLeft);
    const $qRightLen = Arr.len($aRight);

    let $qI = 0;
    let $qJ = 0;

    // Walk both halves in lockstep, always taking the smaller front value.
    while ($qI < $qLeftLen && $qJ < $qRightLen) {
        if ($aLeft[$qI] <= $aRight[$qJ]) {
            Arr.push($aMerged, $aLeft[$qI]);
            $qI = $qI + 1;
        } else {
            Arr.push($aMerged, $aRight[$qJ]);
            $qJ = $qJ + 1;
        }
    }

    // Once one half is exhausted, whatever remains in the other is already
    // sorted and can be appended directly.
    while ($qI < $qLeftLen) {
        Arr.push($aMerged, $aLeft[$qI]);
        $qI = $qI + 1;
    }
    while ($qJ < $qRightLen) {
        Arr.push($aMerged, $aRight[$qJ]);
        $qJ = $qJ + 1;
    }

    return $aMerged;
};

const $aMergeSort = function($aValues) {
	// deprecated in 0.2.97: compiler auto-injects use() clauses for scope transparency
	// JSOL 0.3.0 Note: Retained to reduce scope resolution ambiguity during compilation and polyfill interpretation.
	JSOL.use($aMergeSort, $aMergeSortedHalves);
	// JSOL.use: Explicitly binds external scope to the closure for the PHP target.
	
    const $qLen = Arr.len($aValues);

    // A list of 0 or 1 elements is already sorted: recursion's base case.
    if ($qLen <= 1) {
        return $aValues;
    }

    const $qMid = Math.floor($qLen / 2);
    const $aLeftHalf = Arr.slice($aValues, 0, $qMid);
    const $aRightHalf = Arr.slice($aValues, $qMid, $qLen);

    const $aSortedLeft = $aMergeSort($aLeftHalf);
    const $aSortedRight = $aMergeSort($aRightHalf);

    return $aMergeSortedHalves($aSortedLeft, $aSortedRight);
};
