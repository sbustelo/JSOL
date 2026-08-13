// @JSOL v0.2.91

/**
 * @description
 * Computes the number of days between two Gregorian calendar dates. Each
 * date is first converted to "days since the start of year 1" (a plain
 * day count with no months in it), by adding up full years passed (using
 * the same leap-year rule as leap-year.jsol.js) plus days into the
 * current year from a fixed month-length table. Reducing both dates to a
 * single linear count turns "days between" into a simple subtraction,
 * instead of walking month by month.
 *
 * This file defines a helper function ($qDaysSinceEpoch) alongside the
 * main one: the @contract cases match $qDaysBetweenDates by parameter
 * name, since that is the function meant to be run against test inputs.
 *
 * @param {integer} $qYear1 - Year of the first date.
 * @param {integer} $qMonth1 - Month of the first date, 1-12.
 * @param {integer} $qDay1 - Day of the first date.
 * @param {integer} $qYear2 - Year of the second date.
 * @param {integer} $qMonth2 - Month of the second date, 1-12.
 * @param {integer} $qDay2 - Day of the second date.
 * @returns {integer} - Days from the first date to the second (negative
 *   if the second date comes before the first).
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$qYear1": 2026, "$qMonth1": 1, "$qDay1": 1, "$qYear2": 2026, "$qMonth2": 8, "$qDay2": 13 },
 *     { "$qYear1": 2024, "$qMonth1": 2, "$qDay1": 28, "$qYear2": 2024, "$qMonth2": 3, "$qDay2": 1 }
 *   ]
 * }
 */

const $qDaysSinceEpoch = function($qYear, $qMonth, $qDay) {
    // Full years elapsed before $qYear, counting the leap days those years
    // contributed (same rule as leap-year.jsol.js, expressed with counts
    // instead of a boolean).
    const $qY = $qYear - 1;
    const $qDaysBeforeYear = (365 * $qY) + Math.floor($qY / 4) - Math.floor($qY / 100) + Math.floor($qY / 400);

    // Cumulative days before each month, in a non-leap year.
    const $aCumulativeDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let $qDaysBeforeMonth = $aCumulativeDays[$qMonth - 1];

    // If $qYear itself is a leap year and the date is past February, the
    // extra day (Feb 29) falls before this month and must be added.
    const $bLeap = ($qYear % 400 === 0) || (($qYear % 4 === 0) && ($qYear % 100 !== 0));
    if ($bLeap === true && $qMonth > 2) {
        $qDaysBeforeMonth = $qDaysBeforeMonth + 1;
    }

    return $qDaysBeforeYear + $qDaysBeforeMonth + $qDay;
};

const $qDaysBetweenDates = function($qYear1, $qMonth1, $qDay1, $qYear2, $qMonth2, $qDay2) {
    const $qDays1 = $qDaysSinceEpoch($qYear1, $qMonth1, $qDay1);
    const $qDays2 = $qDaysSinceEpoch($qYear2, $qMonth2, $qDay2);

    return $qDays2 - $qDays1;
};