// @JSOL v0.2.94

/**
 @description
 Sorts an array of numbers into ascending order using quicksort (Hoare /
 CLRS chapter 7): chooses the last element as a pivot, partitions the
 array into elements smaller than and larger than the pivot, then
 recursively quicksorts the two sub-arrays.

@param {array<number>} $aValues - Numbers to sort.
@returns {array<number>} - A new array with the same numbers in ascending order.
*/

/**
 @contract
 {
   "cases": [
     { "$aValues": [5, 2, 9, 1, 5, 6] },
     { "$aValues": [] }
   ]
 }
*/

const $mPartition = function($aValues, $qLow, $qHigh) {
    const $nPivot = $aValues[$qHigh];
    let $qI = $qLow - 1;

    for (let $qJ = $qLow; $qJ < $qHigh; $qJ = $qJ + 1) {
        if ($aValues[$qJ] <= $nPivot) {
            $qI = $qI + 1;
            const $nTemp1 = $aValues[$qI];
            $aValues[$qI] = $aValues[$qJ];
            $aValues[$qJ] = $nTemp1;
        }
    }

    const $nTemp2 = $aValues[$qI + 1];
    $aValues[$qI + 1] = $aValues[$qHigh];
    $aValues[$qHigh] = $nTemp2;

    // Returns both the mutated array and the pivot index to ensure cross-engine compatibility.
    return Map.create("array", $aValues, "pivot", $qI + 1);
};

const $aQuickSortRange = function($aValues, $qLow, $qHigh) {
    // JSOL.use: Binds internal function dependencies for isolated closure scopes in target engines.
    JSOL.use($aQuickSortRange, $mPartition);

    if ($qLow < $qHigh) {
        const $mPartResult = $mPartition($aValues, $qLow, $qHigh);
        $aValues = $mPartResult["array"];
        const $qPivot = $mPartResult["pivot"];

        // Cross-Engine Parity Note: Re-assigning array return values ensures mutation persistence
        // across target runtimes where arrays are passed by value (e.g., PHP) vs passed by reference (e.g., JS/TS).
        $aValues = $aQuickSortRange($aValues, $qLow, $qPivot - 1);
        $aValues = $aQuickSortRange($aValues, $qPivot + 1, $qHigh);
    }

    return $aValues;
};

const $aQuickSort = function($aValues) {
    // JSOL.use: Explicitly imports external function reference into the closure scope.
    JSOL.use($aQuickSortRange);

    let $aSorted = Arr.slice($aValues, 0, Arr.count($aValues));
    $aSorted = $aQuickSortRange($aSorted, 0, Arr.count($aSorted) - 1);
    return $aSorted;
};