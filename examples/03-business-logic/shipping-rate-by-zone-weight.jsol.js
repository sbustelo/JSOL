// @JSOL v0.2.91

/**
 @description
 Computes shipping cost from a destination zone and package weight. Each
 zone has its own base handling cost and per-kilogram rate, mirroring how
 most carriers actually price shipments: a flat cost plus a weight-based
 charge, varying by distance zone, rather than one formula applied
 uniformly everywhere.

@param {string} $sZone - Shipping zone: "local", "national", or "international".
@param {number} $nWeightKg - Package weight in kilograms.
@returns {number} - Total shipping cost.
*/

/**
 @contract
 {
   "cases": [
     { "$sZone": "local", "$nWeightKg": 2 },
     { "$sZone": "national", "$nWeightKg": 5 },
     { "$sZone": "international", "$nWeightKg": 3 }
   ]
 }
*/

const $nShippingCost = function($sZone, $nWeightKg) {
    let $nBaseRate = 0;
    let $nPerKgRate = 0;

    if ($sZone === "local") {
        $nBaseRate = 3;
        $nPerKgRate = 0.5;
    } else if ($sZone === "national") {
        $nBaseRate = 8;
        $nPerKgRate = 1.2;
    } else if ($sZone === "international") {
        $nBaseRate = 25;
        $nPerKgRate = 4;
    }
    // An unrecognized zone falls through with both rates at 0: this
    // function only prices known zones, the caller validates $sZone first.

    return $nBaseRate + ($nWeightKg * $nPerKgRate);
};
