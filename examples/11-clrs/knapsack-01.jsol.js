// @JSOL v0.2.91

/**
 @description
 Solves the 0/1 knapsack problem: given item weights $aWeights, item
 values $aValues (same length, matched by index), and a capacity
 $qCapacity, finds the maximum total value achievable by choosing a
 subset of items whose combined weight does not exceed $qCapacity. Each
 item can be taken at most once (the "0/1": take it or don't).
  Solved bottom-up with a 2D table $aTable, where $aTable[i][w] holds the
 best value achievable using only the first i items with capacity w. For
 each item, the choice is binary: leave $aTable[i][w] the same as
 without this item ($aTable[i-1][w]), or take the item, if it fits, and
 add its value to the best solution for the remaining capacity
 ($aTable[i-1][w - weight] + value). The table keeps whichever is larger.

@param {array<integer>} $aWeights - Weight of each item.
@param {array<integer>} $aValues - Value of each item, matched by index to $aWeights.
@param {integer} $qCapacity - Maximum total weight the knapsack can hold.
@returns {integer} - Maximum total value achievable within $qCapacity.
*/

/**
 @contract
 {
   "cases": [
     { "$aWeights": [1, 3, 4, 5], "$aValues": [1, 4, 5, 7], "$qCapacity": 7 }
   ]
 }
*/

const $qKnapsack01 = function($aWeights, $aValues, $qCapacity) {
    const $qItemCount = Arr.len($aWeights);

    // $aTable[i][w]: best value using only the first i items, capacity w.
    // Row 0 (no items) and column 0 (no capacity) are always 0.
    const $aTable = [];
    for (let $qI = 0; $qI <= $qItemCount; $qI = $qI + 1) {
        const $aRow = [];
        for (let $qW = 0; $qW <= $qCapacity; $qW = $qW + 1) {
            Arr.push($aRow, 0);
        }
        Arr.push($aTable, $aRow);
    }

    for (let $qI = 1; $qI <= $qItemCount; $qI = $qI + 1) {
        const $qItemWeight = $aWeights[$qI - 1];
        const $qItemValue = $aValues[$qI - 1];

        for (let $qW = 0; $qW <= $qCapacity; $qW = $qW + 1) {
            // Leaving the item out is always an option.
            $aTable[$qI][$qW] = $aTable[$qI - 1][$qW];

            // Taking the item is only an option if it fits, and only worth
            // it if it beats leaving it out.
            if ($qItemWeight <= $qW) {
                const $qValueIfTaken = $aTable[$qI - 1][$qW - $qItemWeight] + $qItemValue;
                if ($qValueIfTaken > $aTable[$qI][$qW]) {
                    $aTable[$qI][$qW] = $qValueIfTaken;
                }
            }
        }
    }

    return $aTable[$qItemCount][$qCapacity];
};
