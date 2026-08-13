// @JSOL v0.2.91

/**
 * @description
 * Makes change for $qAmount using dynamic programming: builds a table
 * $aMinCoins where $aMinCoins[$i] holds the minimum number of coins needed
 * to make exactly $i, for every $i from 0 up to $qAmount. Each entry is
 * computed from smaller entries already solved: $aMinCoins[$i] is the best
 * of ($aMinCoins[$i - $coin] + 1) over every denomination $coin that fits,
 * which is why the table fills bottom-up, smallest amount first.
 *
 * Unlike greedy-coin-change.jsol.js, this is always optimal for any set of
 * denominations, because every combination is checked through the table
 * instead of committing to the largest coin first. The cost is higher:
 * O(amount * number of denominations) instead of greedy's near-linear pass.
 *
 * @param {array<integer>} $aDenominations - Coin values, in any order.
 * @param {integer} $qAmount - Target amount to make change for.
 * @returns {integer} - Minimum number of coins needed, or -1 if $qAmount
 *   cannot be reached exactly with these denominations.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$aDenominations": [25, 10, 5, 1], "$qAmount": 41 },
 *     { "$aDenominations": [4, 3, 1], "$qAmount": 6 }
 *   ]
 * }
 */

const $qDpCoinChange = function($aDenominations, $qAmount) {
    // $qSentinel: larger than any achievable coin count, stands in for
    // "not yet reachable". $qAmount + 1 coins is always more than any
    // valid solution could ever need.
    const $qSentinel = $qAmount + 1;
    const $qDenomCount = Arr.count($aDenominations);

    // Build the table with every entry unreachable, except 0 coins needed
    // to make amount 0.
    const $aMinCoins = [];
    for (let $i = 0; $i <= $qAmount; $i = $i + 1) {
        Arr.push($aMinCoins, $qSentinel);
    }
    $aMinCoins[0] = 0;

    for (let $qTarget = 1; $qTarget <= $qAmount; $qTarget = $qTarget + 1) {
        for (let $qD = 0; $qD < $qDenomCount; $qD = $qD + 1) {
            const $qCoin = $aDenominations[$qD];
            if ($qCoin <= $qTarget) {
                const $qCandidate = $aMinCoins[$qTarget - $qCoin] + 1;
                if ($qCandidate < $aMinCoins[$qTarget]) {
                    $aMinCoins[$qTarget] = $qCandidate;
                }
            }
        }
    }

    if ($aMinCoins[$qAmount] === $qSentinel) {
        return -1;
    }

    return $aMinCoins[$qAmount];
};
