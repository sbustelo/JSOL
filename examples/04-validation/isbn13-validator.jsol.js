// @JSOL v0.2.91

/**
 * @description
 * Validates an ISBN-13 using its weighted checksum: each of the first 12
 * digits is multiplied by an alternating weight of 1 and 3 (1,3,1,3,...),
 * the products are summed, and the 13th digit (the check digit) must bring
 * the total to a multiple of 10.
 *
 * @param {string} $sIsbn - ISBN-13, may contain dashes.
 * @returns {boolean} - True if $sIsbn passes the ISBN-13 checksum.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$sIsbn": "978-0-13-468599-1" },
 *     { "$sIsbn": "978-0-13-468599-2" }
 *   ]
 * }
 */

const $bValidateIsbn13 = function($sIsbn) {
    // Step 1: keep only ASCII digits (same manual walk as luhn-validator.jsol.js).
    const $iRawLen = Str.len($sIsbn);
    let $sDigits = "";
    for (let $i = 0; $i < $iRawLen; $i = $i + 1) {
        const $qCode = Str.char($sIsbn, $i);
        if ($qCode >= 48 && $qCode <= 57) {
            $sDigits = $sDigits + Str.sub($sIsbn, $i, 1);
        }
    }

    if (Str.len($sDigits) !== 13) {
        return false;
    }

    // Step 2: weighted sum over the first 12 digits, alternating 1 and 3.
    let $qSum = 0;
    for (let $i = 0; $i < 12; $i = $i + 1) {
        const $qDigit = Cast.toInt(Str.sub($sDigits, $i, 1));
        let $qWeight = 1;
        if ($i % 2 === 1) {
            $qWeight = 3;
        }
        $qSum = $qSum + ($qDigit * $qWeight);
    }

    // Step 3: the check digit (13th digit) must bring the total to a
    // multiple of 10.
    const $qCheckDigit = Cast.toInt(Str.sub($sDigits, 12, 1));
    return ($qSum + $qCheckDigit) % 10 === 0;
};
