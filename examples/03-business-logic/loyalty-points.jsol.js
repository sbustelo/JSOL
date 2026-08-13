// @JSOL v0.2.91

/**
 * @description
 * Computes loyalty points earned on a purchase: a base rate of 1 point per
 * currency unit spent, multiplied by a tier bonus depending on the
 * customer's membership level. This is the kind of rule that usually lives
 * scattered across a checkout service and a marketing spreadsheet; written
 * as a single pure function, both a developer and whoever owns the loyalty
 * program can read exactly what it does.
 *
 * @param {number} $nPurchaseAmount - Amount spent in the purchase, before points.
 * @param {string} $sTier - Customer tier: "bronze", "silver", or "gold".
 * @returns {integer} - Points earned, rounded down to the nearest whole point.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$nPurchaseAmount": 100, "$sTier": "bronze" },
 *     { "$nPurchaseAmount": 100, "$sTier": "gold" },
 *     { "$nPurchaseAmount": 100, "$sTier": "unknown" }
 *   ]
 * }
 */

const $qLoyaltyPoints = function($nPurchaseAmount, $sTier) {
    // Base rate: 1 point per currency unit spent.
    let $nMultiplier = 1;

    if ($sTier === "silver") {
        $nMultiplier = 1.5;
    } else if ($sTier === "gold") {
        $nMultiplier = 2;
    }
    // Any tier other than "silver" or "gold" (including unrecognized
    // values) falls back to the base multiplier of 1: an unknown tier
    // should never block a purchase from earning at least the base rate.

    return Math.floor($nPurchaseAmount * $nMultiplier);
};
