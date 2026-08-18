// @JSOL v0.2.91

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
 non-negative. That avoids ever depending on how a target language's %
 operator handles a negative dividend, which JS and PHP do not treat
 identically.

@param {integer} $qYear - Full year (e.g. 2026).
@param {integer} $qMonth - Month, 1-12.
@param {integer} $qDay - Day of the month.
@returns {string} - Day of the week: "Sunday" through "Saturday".
*/

/**
 @contract
 {
   "cases": [
     { "$qYear": 2026, "$qMonth": 8, "$qDay": 13 },
     { "$qYear": 2000, "$qMonth": 1, "$qDay": 1 }
   ]
 }
*/

const $sDayOfWeek = function($qYear, $qMonth, $qDay) {
    let $qAdjustedMonth = $qMonth;
    let $qAdjustedYear = $qYear;

    if ($qMonth < 3) {
        $qAdjustedMonth = $qMonth + 12;
        $qAdjustedYear = $qYear - 1;
    }

    const $qK = $qAdjustedYear % 100;
    const $qJ = Math.floor($qAdjustedYear / 100);

    const $qH = ($qDay
        + Math.floor((13 * ($qAdjustedMonth + 1)) / 5)
        + $qK
        + Math.floor($qK / 4)
        + Math.floor($qJ / 4)
        + (5 * $qJ)) % 7;

    // $qH: 0=Saturday, 1=Sunday, 2=Monday, ... 6=Friday.
    const $aDayNames = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    return $aDayNames[$qH];
};