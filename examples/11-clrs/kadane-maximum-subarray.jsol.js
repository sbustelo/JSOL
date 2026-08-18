// @JSOL v0.2.91

/**
 @description
 Finds the maximum sum of any contiguous subarray of $aValues, using
 Kadane's algorithm, the linear-time solution to the maximum subarray
 problem discussed in CLRS chapter 4 alongside a divide-and-conquer
 approach. At each position, decides whether extending the previous
 best-ending-here subarray beats starting fresh at the current element:
 $nBestEndingHere = max($aValues[i], $nBestEndingHere + $aValues[i]).
 Tracking the best value seen across every position gives the overall
 answer in a single pass, O(n), versus O(n^2) for checking every
 subarray directly.

@param {array<number>} $aValues - Numbers to scan. Must be non-empty.
@returns {number} - The maximum sum achievable by any contiguous subarray.
*/

/**
 @contract
 {
   "cases": [
     { "$aValues": [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
     { "$aValues": [-3, -1, -2] }
   ]
 }
*/

const $nMaxSubarraySum = function($aValues) {
    let $nBestEndingHere = $aValues[0];
    let $nBestOverall = $aValues[0];

    const $qLen = Arr.count($aValues);
    for (let $i = 1; $i < $qLen; $i = $i + 1) {
        const $nExtend = $nBestEndingHere + $aValues[$i];
        const $nFresh = $aValues[$i];

        if ($nExtend > $nFresh) {
            $nBestEndingHere = $nExtend;
        } else {
            $nBestEndingHere = $nFresh;
        }

        if ($nBestEndingHere > $nBestOverall) {
            $nBestOverall = $nBestEndingHere;
        }
    }

    return $nBestOverall;
};
