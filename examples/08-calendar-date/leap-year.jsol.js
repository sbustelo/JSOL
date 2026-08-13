// @JSOL v0.2.91

/**
 * @description
 * Checks whether $qYear is a leap year under the Gregorian calendar rule:
 * divisible by 4, except century years (divisible by 100), which are only
 * leap years if also divisible by 400. This three-level exception exists
 * because a year is not exactly 365.25 days long, it is closer to
 * 365.2425, and dropping 3 leap days every 400 years is what keeps the
 * calendar in step with the actual solar year over centuries.
 *
 * @param {integer} $qYear - Year to test (Gregorian calendar).
 * @returns {boolean} - True if $qYear is a leap year.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$qYear": 2000 },
 *     { "$qYear": 1900 },
 *     { "$qYear": 2024 },
 *     { "$qYear": 2023 }
 *   ]
 * }
 */

const $bIsLeapYear = function($qYear) {
    if ($qYear % 400 === 0) {
        return true;
    }
    if ($qYear % 100 === 0) {
        return false;
    }
    return $qYear % 4 === 0;
};