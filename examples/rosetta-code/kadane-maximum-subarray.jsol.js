// @JSOL v0.2.97

/**
 @description
 Rosetta Code task: https://rosettacode.org/wiki/Greatest_subsequential_sum
 (a.k.a. "Maximum subarray") — the task asks for the actual contiguous
 subsequence with the maximum sum, not just the sum itself, and defines
 an empty subsequence to have sum 0, so an all-negative input must
 return an empty subsequence rather than the least-negative single
 element.

 Finds the contiguous subarray of `$aValues` with the maximum possible
 sum, using Kadane's algorithm (CLRS chapter 4, linear-time variant): a
 running sum is extended one element at a time; whenever it drops below
 zero it is reset to zero and a new candidate start position is marked,
 because no subarray beginning at a negative running total can ever beat
 one that starts fresh from here. The best sum seen, together with the
 start/end position that produced it, is tracked across the single pass.

 An empty array, or an array where every element is negative, produces
 sum 0 and an empty subarray: the task defines the empty subsequence to
 have sum 0, so it is always at least as good as any subarray that would
 sum below 0.

@param {array<number>} $aValues - Numbers to scan. May be empty.
@returns {Map} - "sum" (the maximum sum found, 0 if none is positive) and
   "subarray" (the actual contiguous elements that produce it, empty if
   "sum" is 0).
*/

/**
 @contract
 {
   "cases": [
     { "$aValues": [-1, -2, 3, 5, 6, -2, -1, 4, -4, 2, -1] },
     { "$aValues": [-1, -2, -3, -4, -5] },
     { "$aValues": [] },
     { "$aValues": [1, 2, 3, 4, 5, -8, -9, -20, 40, 25, -5] }
   ]
 }
*/

const $mMaxSubarray = function($aValues) {
    let $nBestSum = 0;
    let $nCurrentSum = 0;
    let $qBestStart = 0;
    let $qBestEnd = -1;
    let $qCurrentStart = 0;

    const $qLen = Arr.len($aValues);
    for (let $i = 0; $i < $qLen; $i = $i + 1) {
        $nCurrentSum = $nCurrentSum + $aValues[$i];

        if ($nCurrentSum > $nBestSum) {
            $nBestSum = $nCurrentSum;
            $qBestStart = $qCurrentStart;
            $qBestEnd = $i;
        } else if ($nCurrentSum < 0) {
            // Running total went negative: no subarray extending through
            // here can ever beat one that starts fresh at the next index.
            $nCurrentSum = 0;
            $qCurrentStart = $i + 1;
        }
    }

    const $aSubarray = [];
    if ($qBestEnd >= $qBestStart) {
        for (let $i = $qBestStart; $i <= $qBestEnd; $i = $i + 1) {
            Arr.push($aSubarray, $aValues[$i]);
        }
    }

    return Map.create("sum", $nBestSum, "subarray", $aSubarray);
};
