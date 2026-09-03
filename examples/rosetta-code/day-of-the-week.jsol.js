// @JSOL v0.2.97

/**
 @description
 Rosetta Code task: https://rosettacode.org/wiki/Day_of_the_week — the
 task asks for every year in a range for which December 25th falls on a
 Sunday. This function solves that literally, calling `$sDayOfWeek` once
 per year in the range; its own contract embeds the task's known-correct
 answer, so the contract doubles as a check against the task statement
 itself, not just against the algorithm.

 Returns every year in `[$nStartYear, $nEndYear]` for which December 25th
 falls on a Sunday.

@param {number} $nStartYear - First year to check, inclusive.
@param {number} $nEndYear - Last year to check, inclusive.
@returns {array<number>} - Years whose Christmas Day is a Sunday.
*/

/**
 @contract
 {
   "cases": [
     { "$nStartYear": 2008, "$nEndYear": 2121 }
   ],
   "expected_for_case_0": [2011, 2016, 2022, 2033, 2039, 2044, 2050, 2061, 2067, 2072, 2078, 2089, 2095, 2101, 2107, 2112, 2118]
 }
*/

const $aChristmasSundays = function($nStartYear, $nEndYear) {
    const $aYears = [];

    for (let $nYear = $nStartYear; $nYear <= $nEndYear; $nYear = $nYear + 1) {
        const $sWeekday = $sDayOfWeek($nYear, 12, 25);
        if ($sWeekday === "Sunday") {
            Arr.push($aYears, $nYear);
        }
    }

    return $aYears;
};

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
