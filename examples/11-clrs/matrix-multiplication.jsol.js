// @JSOL v0.2.91

/**
 @description
 Multiplies two matrices, $aMatrixA (m x n) and $aMatrixB (n x p), using
 the standard triple-loop definition (CLRS chapter 4): each entry of the
 result is the dot product of a row of $aMatrixA with a column of
 $aMatrixB. Both matrices are represented as an array of row-arrays; the
 number of columns in $aMatrixA must equal the number of rows in
 $aMatrixB.
  O(n^3) for square matrices with this direct approach. CLRS also covers
 Strassen's algorithm, which improves on this asymptotically at the cost
 of a much more intricate recursive structure, out of scope here.

@param {array<array<number>>} $aMatrixA - m x n matrix.
@param {array<array<number>>} $aMatrixB - n x p matrix.
@returns {array<array<number>>} - The m x p product matrix.
*/

/**
 @contract
 {
   "cases": [
     { "$aMatrixA": [[1, 2], [3, 4]], "$aMatrixB": [[5, 6], [7, 8]] }
   ]
 }
*/

const $aMatrixMultiply = function($aMatrixA, $aMatrixB) {
    const $qRowsA = Arr.count($aMatrixA);
    const $qColsA = Arr.count($aMatrixA[0]);
    const $qColsB = Arr.count($aMatrixB[0]);

    const $aResult = [];

    for (let $qI = 0; $qI < $qRowsA; $qI = $qI + 1) {
        const $aResultRow = [];

        for (let $qJ = 0; $qJ < $qColsB; $qJ = $qJ + 1) {
            let $nSum = 0;
            for (let $qK = 0; $qK < $qColsA; $qK = $qK + 1) {
                $nSum = $nSum + ($aMatrixA[$qI][$qK] * $aMatrixB[$qK][$qJ]);
            }
            Arr.push($aResultRow, $nSum);
        }

        Arr.push($aResult, $aResultRow);
    }

    return $aResult;
};
