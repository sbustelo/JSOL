// @JSOL v0.2.91

/**
 @description
 Makes change for $qAmount using the greedy algorithm: at each step, take
 the largest coin from $aDenominations that still fits within the amount
 remaining, repeat until nothing is left.
  Greedy is fast and gives the minimum number of coins for "canonical"
 denomination systems, the kind most real currencies actually use (e.g.
 25/10/5/1). It is NOT guaranteed optimal for arbitrary denomination
 sets. See dp-coin-change.jsol.js, which solves the exact same problem
 and is always optimal, at a higher computational cost. Running both
 against the same input is the point of keeping them side by side.

@param {array<integer>} $aDenominations - Coin values, must be sorted descending.
@param {integer} $qAmount - Target amount to make change for.
@returns {Map} - "coins" (array of coins used, in the order picked) and
   "count" (how many coins that is). If $qAmount cannot be reached
   exactly, "coins" is empty and "count" is -1.
*/

/**
 @contract
 {
   "cases": [
     { "$aDenominations": [25, 10, 5, 1], "$qAmount": 41 },
     { "$aDenominations": [4, 3, 1], "$qAmount": 6 }
   ]
 }
*/

const $mGreedyCoinChange = function($aDenominations, $qAmount) {
    const $qDenomCount = Arr.count($aDenominations);
    const $aCoinsUsed = [];
    let $qRemaining = $qAmount;

    for (let $i = 0; $i < $qDenomCount; $i = $i + 1) {
        const $qCoin = $aDenominations[$i];
        while ($qRemaining >= $qCoin) {
            Arr.push($aCoinsUsed, $qCoin);
            $qRemaining = $qRemaining - $qCoin;
        }
    }

    if ($qRemaining !== 0) {
        // No combination of these denominations reaches $qAmount exactly.
        return Map.create("coins", [], "count", -1);
    }

    return Map.create("coins", $aCoinsUsed, "count", Arr.count($aCoinsUsed));
};
