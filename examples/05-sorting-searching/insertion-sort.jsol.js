// @JSOL v0.2.91

/**
 @description
 Sorts an array of numbers into ascending order using insertion sort:
 builds the sorted result one element at a time, taking the next unsorted
 value and sliding it left past every already-sorted value greater than
 it, the way a card player sorts a hand by inserting each new card into
 its correct place among the cards already in hand.
  O(n^2) worst case, but O(n) when the array is already (or nearly)
 sorted, since the inner while loop then does almost no shifting.

@param {array<number>} $aValues - Numbers to sort.
@returns {array<number>} - A new array with the same numbers in ascending order.
*/

/**
 @contract
 {
   "cases": [
     { "$aValues": [5, 2, 9, 1, 5, 6] },
     { "$aValues": [1, 2, 3] },
     { "$aValues": [] }
   ]
 }
*/

const $aInsertionSort = function($aValues) {
    // Arr.slice over the full range makes a shallow copy: JSOL has no
    // dedicated Arr.copy, and the input array must not be mutated.
    const $aSorted = Arr.slice($aValues, 0, Arr.count($aValues));
    const $qLen = Arr.count($aSorted);

    for (let $i = 1; $i < $qLen; $i = $i + 1) {
        const $nKey = $aSorted[$i];
        let $qJ = $i - 1;

        // Shift every sorted element greater than $nKey one position right,
        // opening up the slot where $nKey belongs.
        while ($qJ >= 0 && $aSorted[$qJ] > $nKey) {
            $aSorted[$qJ + 1] = $aSorted[$qJ];
            $qJ = $qJ - 1;
        }

        $aSorted[$qJ + 1] = $nKey;
    }

    return $aSorted;
};
