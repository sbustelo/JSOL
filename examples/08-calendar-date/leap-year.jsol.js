// @JSOL v0.2.97

/**
 @description
 Checks whether $nYear is a leap year under the Gregorian calendar rule:
 divisible by 4, except century years (divisible by 100), which are only
 leap years if also divisible by 400. This three-level exception exists
 because a year is not exactly 365.25 days long, it is closer to
 365.2425, and dropping 3 leap days every 400 years is what keeps the
 calendar in step with the actual solar year over centuries.

@param {number} $nYear - Year to test (Gregorian calendar).
@returns {boolean} - True if $nYear is a leap year.
*/

/**
 @contract
 {
   "cases": [
     { "$nYear": 2000 },
     { "$nYear": 1900 },
     { "$nYear": 2024 },
     { "$nYear": 2023 }
   ]
 }
*/

const $bIsLeapYear = function($nYear) {
    // JSOL 0.3.0: All modulo evaluations use Math.modX for cross-target determinism.
    if (Math.modX($nYear, 400) === 0) {
        return true;
    }
    if (Math.modX($nYear, 100) === 0) {
        return false;
    }
    return Math.modX($nYear, 4) === 0;
};