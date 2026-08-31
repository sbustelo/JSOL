// @JSOL v0.2.97

/**
 @description
 Computes the day of the week for a Gregorian calendar date using
 Zeller's Congruence, a closed-form formula published by Christian
 Zeller in the 1880s. January and February are treated as months 13 and
 14 of the *previous* year, which is why the formula subtracts 1 from
 the year for those two months before anything else: it keeps March as
 the start of the "formula year", avoiding a separate leap-day special
 case inside the arithmetic itself.
  The classic formula ends in "- 2*J"; here it is written as "+ 5*J"
 instead (-2 and +5 are congruent mod 7), so every term in the sum stays
 non-negative.

@param {number} $nYear - Full year (e.g. 2026).
@param {number} $nMonth - Month, 1-12.
@param {number} $nDay - Day of the month.
@returns {string} - Day of the week: "Sunday" through "Saturday".
*/

/**
 @contract
 {
   "cases": [
     { "$nYear": 2026, "$nMonth": 8, "$nDay": 13 },
     { "$nYear": 2000, "$nMonth": 1, "$nDay": 1 }
   ]
 }
*/

const $sDayOfWeek = function($nYear, $nMonth, $nDay) {
    let $nAdjustedMonth = $nMonth;
    let $nAdjustedYear = $nYear;

    if ($nMonth < 3) {
        $nAdjustedMonth = $nMonth + 12;
        $nAdjustedYear = $nYear - 1;
    }

    // JSOL 0.3.0: Replaced % with Math.modX to guarantee exact modulo resolution.
    const $nK = Math.modX($nAdjustedYear, 100);
    const $nJ = Math.floor($nAdjustedYear / 100);

    const $nH = Math.modX(($nDay
        + Math.floor((13 * ($nAdjustedMonth + 1)) / 5)
        + $nK
        + Math.floor($nK / 4)
        + Math.floor($nJ / 4)
        + (5 * $nJ)), 7);

    // $nH: 0=Saturday, 1=Sunday, 2=Monday, ... 6=Friday.
    const $aDayNames = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    return $aDayNames[$nH];
};