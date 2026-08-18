// @JSOL v0.2.91

/**
 @description
 Computes row $qN (0-indexed) of Pascal's Triangle: row 0 is [1], row 1
 is [1,1], row 2 is [1,2,1], and so on, where each row holds the
 binomial coefficients C(n,0) through C(n,n). Built iteratively rather
 than by looking up factorials directly: each entry is derived from the
 previous one in the same row via C(n,k) = C(n,k-1) * (n-k+1) / k, which
 avoids computing large factorials that grow far faster than the final
 coefficients themselves.

@param {integer} $qN - Row index, 0-based.
@returns {array<integer>} - The $qN-th row, containing $qN + 1 entries.
*/

/**
 @contract
 {
   "cases": [
     { "$qN": 5 },
     { "$qN": 0 }
   ]
 }
*/

const $aPascalsTriangleRow = function($qN) {
    const $aRow = [1];

    for (let $qK = 1; $qK <= $qN; $qK = $qK + 1) {
        const $qPrevious = $aRow[$qK - 1];
        const $qNext = Math.floor(($qPrevious * ($qN - $qK + 1)) / $qK);
        Arr.push($aRow, $qNext);
    }

    return $aRow;
};