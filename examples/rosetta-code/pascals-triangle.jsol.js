// @JSOL v0.2.97

/**
 @description
 Rosetta Code task: https://rosettacode.org/wiki/Pascal%27s_triangle —
 the task asks to draw the triangle (rows 0..N, centered), not to return
 a single row. JSOL has no console/drawing primitive, so "drawing" here
 means returning one string with embedded newlines, which is what a
 caller would print.

 Builds the first `$qRowCount` rows of Pascal's Triangle (row 0 is `[1]`,
 row 1 is `[1,1]`, row 2 is `[1,2,1]`, ...) and renders them as one
 centered, multi-line string, one row per line, each entry padded to a
 common cell width so the triangle shape is visually centered rather
 than left-aligned.

 Each row is computed the same way a single row would be:
 `C(n,k) = C(n,k-1) * (n-k+1) / k`, built iteratively rather than via
 factorials directly, since factorials grow far faster than the final
 coefficients themselves.

@param {integer} $qRowCount - How many rows to draw (row 0 through row
   $qRowCount - 1).
@returns {string} - The triangle as a single string, rows separated by
   "\n", each row centered relative to the widest (last) row.
*/

/**
 @contract
 {
   "cases": [
     { "$qRowCount": 5 },
     { "$qRowCount": 1 }
   ]
 }
*/

const $sPascalsTriangle = function($qRowCount) {
    // Build every row first: the last row is the widest, and its cell
    // width is what every earlier row needs to center against.
    const $aRows = [];
    for (let $qN = 0; $qN < $qRowCount; $qN = $qN + 1) {
        const $aRow = [1];
        for (let $qK = 1; $qK <= $qN; $qK = $qK + 1) {
            const $qPrevious = $aRow[$qK - 1];
            const $qNext = Math.floor(($qPrevious * ($qN - $qK + 1)) / $qK);
            Arr.push($aRow, $qNext);
        }
        Arr.push($aRows, $aRow);
    }

    const $aLastRow = $aRows[$qRowCount - 1];
    let $qCellWidth = 0;
    for (let $i = 0; $i < Arr.len($aLastRow); $i = $i + 1) {
        const $qDigits = Str.len(Cast.toStr($aLastRow[$i]));
        if ($qDigits > $qCellWidth) {
            $qCellWidth = $qDigits;
        }
    }
    $qCellWidth = $qCellWidth + 1;

    let $sTriangle = "";
    for (let $qN = 0; $qN < $qRowCount; $qN = $qN + 1) {
        const $aRow = $aRows[$qN];
        const $qMissingCells = $qRowCount - 1 - $qN;
        let $sLine = Str.repeat(" ", Math.idiv($qMissingCells * $qCellWidth, 2));

        for (let $qK = 0; $qK < Arr.len($aRow); $qK = $qK + 1) {
            let $sCell = Cast.toStr($aRow[$qK]);
            while (Str.len($sCell) < $qCellWidth) {
                $sCell = $sCell + " ";
            }
            $sLine = $sLine + $sCell;
        }

        if ($qN < $qRowCount - 1) {
            $sTriangle = $sTriangle + $sLine + "\n";
        } else {
            $sTriangle = $sTriangle + $sLine;
        }
    }

    return $sTriangle;
};
