// @JSOL v0.2.97

/**
 @description
 Rosetta Code task: https://rosettacode.org/wiki/Longest_common_subsequence
 — the task asks for the LCS itself, not just its length p, so this
 version backtracks through the DP table to reconstruct the actual
 subsequence rather than returning only the table's final cell.

 Finds the Longest Common Subsequence of `$sTextA` and `$sTextB`: the
 longest string obtainable by deleting zero or more characters from
 each, that is common to both, using the classic O(m*n) dynamic
 programming table (CLRS). `$aTable[i][j]` holds the LCS length of the
 first i characters of `$sTextA` and the first j characters of
 `$sTextB`.

 After filling the table, the actual subsequence is recovered by
 backtracking from `$aTable[m][n]`: whenever the current characters
 match, that character belongs to the LCS and both indices step back
 together; otherwise the walk steps toward whichever neighboring cell
 (one row up, or one column left) holds the larger value, since that is
 the direction the optimal choice came from. The characters are
 collected from the end backwards, so they are reversed once at the end.

@param {string} $sTextA - First string.
@param {string} $sTextB - Second string.
@returns {string} - The longest common subsequence of $sTextA and $sTextB.
*/

/**
 @contract
 {
   "cases": [
     { "$sTextA": "thisisatest", "$sTextB": "testing123testing" },
     { "$sTextA": "", "$sTextB": "abc" }
   ]
 }
*/

const $sLongestCommonSubsequence = function($sTextA, $sTextB) {
    const $qLenA = Str.len($sTextA);
    const $qLenB = Str.len($sTextB);

    const $aTable = [];
    for (let $qI = 0; $qI <= $qLenA; $qI = $qI + 1) {
        const $aRow = [];
        for (let $qJ = 0; $qJ <= $qLenB; $qJ = $qJ + 1) {
            Arr.push($aRow, 0);
        }
        Arr.push($aTable, $aRow);
    }

    for (let $qI = 1; $qI <= $qLenA; $qI = $qI + 1) {
        for (let $qJ = 1; $qJ <= $qLenB; $qJ = $qJ + 1) {
            const $sCharA = Str.sub($sTextA, $qI - 1, 1);
            const $sCharB = Str.sub($sTextB, $qJ - 1, 1);

            if ($sCharA === $sCharB) {
                $aTable[$qI][$qJ] = $aTable[$qI - 1][$qJ - 1] + 1;
            } else if ($aTable[$qI - 1][$qJ] >= $aTable[$qI][$qJ - 1]) {
                $aTable[$qI][$qJ] = $aTable[$qI - 1][$qJ];
            } else {
                $aTable[$qI][$qJ] = $aTable[$qI][$qJ - 1];
            }
        }
    }

    // Backtrack from the bottom-right corner to recover the actual
    // characters of the LCS, not just its length.
    let $sReversedSubsequence = "";
    let $qI = $qLenA;
    let $qJ = $qLenB;

    while ($qI > 0 && $qJ > 0) {
        const $sCharA = Str.sub($sTextA, $qI - 1, 1);
        const $sCharB = Str.sub($sTextB, $qJ - 1, 1);

        if ($sCharA === $sCharB) {
            $sReversedSubsequence = $sReversedSubsequence + $sCharA;
            $qI = $qI - 1;
            $qJ = $qJ - 1;
        } else if ($aTable[$qI - 1][$qJ] >= $aTable[$qI][$qJ - 1]) {
            $qI = $qI - 1;
        } else {
            $qJ = $qJ - 1;
        }
    }

    // Characters were collected end-first; reverse into reading order.
    const $qSubLen = Str.len($sReversedSubsequence);
    let $sSubsequence = "";
    for (let $qK = 0; $qK < $qSubLen; $qK = $qK + 1) {
        $sSubsequence = $sSubsequence + Str.sub($sReversedSubsequence, $qSubLen - 1 - $qK, 1);
    }

    return $sSubsequence;
};
