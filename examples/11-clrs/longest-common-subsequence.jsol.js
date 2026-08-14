// @JSOL v0.2.91

/**
 * @description
 * Computes the length of the longest common subsequence (LCS) of
 * $sTextA and $sTextB (CLRS chapter 15): the longest sequence of
 * characters that appears in both strings in the same relative order,
 * though not necessarily contiguously. Solved bottom-up with a 2D table
 * $aTable, where $aTable[i][j] holds the LCS length of the first i
 * characters of $sTextA and the first j characters of $sTextB: if the two
 * characters at that position match, it extends the LCS found without
 * them by 1; if not, it takes whichever of "drop the last character of A"
 * or "drop the last character of B" gave the longer LCS so far.
 *
 * @param {string} $sTextA - First string.
 * @param {string} $sTextB - Second string.
 * @returns {integer} - Length of the longest common subsequence.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$sTextA": "ABCBDAB", "$sTextB": "BDCABA" },
 *     { "$sTextA": "abc", "$sTextB": "xyz" }
 *   ]
 * }
 */

const $qLongestCommonSubsequence = function($sTextA, $sTextB) {
    const $qLenA = Str.len($sTextA);
    const $qLenB = Str.len($sTextB);

    // $aTable[i][j]: LCS length using the first i chars of A and the
    // first j chars of B. Row/column 0 (empty prefix) is always 0.
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

    return $aTable[$qLenA][$qLenB];
};
