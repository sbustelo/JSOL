// @JSOL v0.2.97

/**
 @description
 Computes the number of days between two Gregorian calendar dates. Each
 date is first converted to "days since the start of year 1" (a plain
 day count with no months in it), by adding up full years passed (using
 the same leap-year rule as leap-year.jsol.js) plus days into the
 current year from a fixed month-length table. Reducing both dates to a
 single linear count turns "days between" into a simple subtraction,
 instead of walking month by month.
  This file defines a helper function ($nDaysSinceEpoch) alongside the
 main one: the @contract cases match $nDaysBetweenDates by parameter
 name, since that is the function meant to be run against test inputs.

@param {number} $nYear1 - Year of the first date.
@param {number} $nMonth1 - Month of the first date, 1-12.
@param {number} $nDay1 - Day of the first date.
@param {number} $nYear2 - Year of the second date.
@param {number} $nMonth2 - Month of the second date, 1-12.
@param {number} $nDay2 - Day of the second date.
@returns {number} - Days from the first date to the second (negative
   if the second date comes before the first).
*/

/**
 @contract
 {
   "cases": [
     { "$nYear1": 2026, "$nMonth1": 1, "$nDay1": 1, "$nYear2": 2026, "$nMonth2": 8, "$nDay2": 13 },
     { "$nYear1": 2024, "$nMonth1": 2, "$nDay1": 28, "$nYear2": 2024, "$nMonth2": 3, "$nDay2": 1 }
   ]
 }
*/

const $nDaysSinceEpoch = function($nYear, $nMonth, $nDay) {
    // Full years elapsed before $nYear, counting the leap days those years
    // contributed (same rule as leap-year.jsol.js, expressed with counts
    // instead of a boolean).
    const $nY = $nYear - 1;
    const $nDaysBeforeYear = (365 * $nY) + Math.floor($nY / 4) - Math.floor($nY / 100) + Math.floor($nY / 400);

    // Cumulative days before each month, in a non-leap year.
    const $aCumulativeDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let $nDaysBeforeMonth = $aCumulativeDays[$nMonth - 1];

    // JSOL 0.3.0: Uses Math.modX for leap year evaluation.
    const $bLeap = (Math.modX($nYear, 400) === 0) || ((Math.modX($nYear, 4) === 0) && (Math.modX($nYear, 100) !== 0));
    if ($bLeap === true && $nMonth > 2) {
        $nDaysBeforeMonth = $nDaysBeforeMonth + 1;
    }

    return $nDaysBeforeYear + $nDaysBeforeMonth + $nDay;
};

const $nDaysBetweenDates = function($nYear1, $nMonth1, $nDay1, $nYear2, $nMonth2, $nDay2) {
    // JSOL 0.3.0 Note: JSOL.use() is explicitly retained to bind scope dependencies 
    // for closure isolation in host target environments.
    JSOL.use($nDaysSinceEpoch);

    const $nDays1 = $nDaysSinceEpoch($nYear1, $nMonth1, $nDay1);
    const $nDays2 = $nDaysSinceEpoch($nYear2, $nMonth2, $nDay2);

    return $nDays2 - $nDays1;
};