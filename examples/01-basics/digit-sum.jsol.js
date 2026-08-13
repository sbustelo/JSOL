// @JSOL v0.2.91

/**
 * @description
 * Sums the individual digits of a non-negative integer $qN
 * (e.g. 493 -> 4 + 9 + 3 = 16). Converts $qN to its text representation
 * once, then reads and casts one character at a time.
 *
 * @param {integer} $qN - Non-negative integer.
 * @returns {integer} - The sum of $qN's decimal digits.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$qN": 493 },
 *     { "$qN": 0 }
 *   ]
 * }
 */

const $qDigitSum = function($qN) {
    const $sDigits = Cast.toStr($qN);
    const $iLen = Str.len($sDigits);
    let $qSum = 0;

    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        $qSum = $qSum + Cast.toInt(Str.sub($sDigits, $i, 1));
    }

    return $qSum;
};
