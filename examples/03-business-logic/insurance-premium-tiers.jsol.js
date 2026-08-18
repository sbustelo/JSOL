// @JSOL v0.2.91

/**
 @description
 Computes an insurance premium by applying a flat multiplier to a base
 premium according to which risk band $qRiskScore falls into. Tiered
 risk-based pricing is one of the oldest patterns in insurance: instead of
 a smooth formula, actuaries define discrete bands with an approved rate
 each, and every policyholder in a band pays the same rate regardless of
 exactly where in the band their score falls.

@param {number} $nBasePremium - Standard premium before any risk adjustment.
@param {integer} $qRiskScore - Risk score, higher means higher risk (0-100).
@returns {number} - Adjusted premium for this risk score.
*/

/**
 @contract
 {
   "cases": [
     { "$nBasePremium": 500, "$qRiskScore": 10 },
     { "$nBasePremium": 500, "$qRiskScore": 55 },
     { "$nBasePremium": 500, "$qRiskScore": 95 }
   ]
 }
*/

const $nInsurancePremium = function($nBasePremium, $qRiskScore) {
    // Checked from highest risk down, so each branch only needs a lower
    // bound: the first match wins.
    if ($qRiskScore >= 80) {
        return $nBasePremium * 2;
    }
    if ($qRiskScore >= 50) {
        return $nBasePremium * 1.5;
    }
    if ($qRiskScore >= 25) {
        return $nBasePremium * 1.2;
    }

    return $nBasePremium;
};
