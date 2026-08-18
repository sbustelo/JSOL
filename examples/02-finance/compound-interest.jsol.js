// @JSOL v0.2.91

/**
 @description
 Computes the future value of a principal amount under compound interest:
 FV = P * (1 + r/n)^(n*t), where interest is calculated and added back to
 the principal $qCompoundsPerYear times per year, so each period earns
 interest on the interest from every prior period, not just on P.

@param {number} $nPrincipal - Initial amount invested or borrowed.
@param {number} $nAnnualRate - Annual interest rate as a decimal (0.05 = 5%).
@param {integer} $qCompoundsPerYear - Times per year interest compounds (12 = monthly).
@param {number} $nYears - Number of years the amount is invested.
@returns {number} - Future value after $nYears.
*/

/**
 @contract
 {
   "cases": [
     { "$nPrincipal": 1000, "$nAnnualRate": 0.05, "$qCompoundsPerYear": 12, "$nYears": 10 },
     { "$nPrincipal": 5000, "$nAnnualRate": 0.03, "$qCompoundsPerYear": 1, "$nYears": 1 }
   ]
 }
*/

const $nCompoundInterest = function($nPrincipal, $nAnnualRate, $qCompoundsPerYear, $nYears) {
    const $nRatePerPeriod = $nAnnualRate / $qCompoundsPerYear;
    const $nTotalPeriods = $qCompoundsPerYear * $nYears;

    return $nPrincipal * Math.pow(1 + $nRatePerPeriod, $nTotalPeriods);
};