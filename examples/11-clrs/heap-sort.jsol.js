// @JSOL v0.2.91

/**
 @description
 Sorts an array of numbers into ascending order using heapsort (CLRS
 chapter 6): treats the array as a binary heap using standard implicit
 indexing (a node at index i has children at 2i+1 and 2i+2), builds a
 max-heap out of the whole array, then repeatedly swaps the root (the
 current largest value) with the last unsorted element and re-heapifies
 the shrinking heap.
  No pointers or node objects needed: the parent/child relationship is
 entirely arithmetic on array indices, which is why heapsort is one of
 the few classic tree-based algorithms that translates directly into
 JSOL's array-only data model.
  O(n log n) in every case, and unlike merge-sort.jsol.js, sorts in place
 with no extra array needed.

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

const $aSiftDown = function($aValues, $qHeapSize, $qRoot) {
    let $qLargest = $qRoot;
    const $qLeftChild = (2 * $qRoot) + 1;
    const $qRightChild = (2 * $qRoot) + 2;

    if ($qLeftChild < $qHeapSize && $aValues[$qLeftChild] > $aValues[$qLargest]) {
        $qLargest = $qLeftChild;
    }
    if ($qRightChild < $qHeapSize && $aValues[$qRightChild] > $aValues[$qLargest]) {
        $qLargest = $qRightChild;
    }

    if ($qLargest !== $qRoot) {
        const $nTemp = $aValues[$qRoot];
        $aValues[$qRoot] = $aValues[$qLargest];
        $aValues[$qLargest] = $nTemp;
        // The swap may have broken the heap property further down; sift
        // down again from the value's new position.
        $aSiftDown($aValues, $qHeapSize, $qLargest);
    }

    return $aValues;
};

const $aHeapSort = function($aValues) {
    const $aSorted = Arr.slice($aValues, 0, Arr.count($aValues));
    const $qLen = Arr.count($aSorted);

    // Build the max-heap: sift down every non-leaf node, from the last one
    // back to the root.
    for (let $qI = Math.floor($qLen / 2) - 1; $qI >= 0; $qI = $qI - 1) {
        $aSiftDown($aSorted, $qLen, $qI);
    }

    // Repeatedly move the current max (the root) to the end of the
    // unsorted region, then re-heapify the smaller remaining heap.
    for (let $qEnd = $qLen - 1; $qEnd > 0; $qEnd = $qEnd - 1) {
        const $nTemp = $aSorted[0];
        $aSorted[0] = $aSorted[$qEnd];
        $aSorted[$qEnd] = $nTemp;
        $aSiftDown($aSorted, $qEnd, 0);
    }

    return $aSorted;
};
