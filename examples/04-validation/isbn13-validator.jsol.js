// @JSOL v0.2.97

/**
 @description
 Validates an ISBN-13 using its weighted checksum: each of the first 12
 digits is multiplied by an alternating weight of 1 and 3 (1,3,1,3,...),
 the products are summed, and the 13th digit (the check digit) must bring
 the total to a multiple of 10.

@param {string} $sIsbn - ISBN-13, may contain dashes.
@returns {boolean} - True if $sIsbn passes the ISBN-13 checksum.
*/

/**
 @contract
 {
   "cases": [
     { "$sIsbn": "978-0-13-468599-1" },
     { "$sIsbn": "978-0-13-468599-2" }
   ]
 }
*/

const $bValidateIsbn13 = function($sIsbn) {
    // Step 1: keep only ASCII digits (same manual walk as luhn-validator.jsol.js).
    const $nRawLen = Str.len($sIsbn);
    let $sDigits = "";
    for (let $nIndex = 0; $nIndex < $nRawLen; $nIndex = $nIndex + 1) {
        const $nCode = Str.char($sIsbn, $nIndex);
        if ($nCode >= 48 && $nCode <= 57) {
            $sDigits = $sDigits + Str.sub($sIsbn, $nIndex, 1);
        }
    }

    if (Str.len($sDigits) !== 13) {
        return false;
    }

    // Step 2: weighted sum over the first 12 digits, alternating 1 and 3.
    let $nSum = 0;
    for (let $nIndex = 0; $nIndex < 12; $nIndex = $nIndex + 1) {
        const $nDigit = Cast.toInt(Str.sub($sDigits, $nIndex, 1));
        let $nWeight = 1;
        // JSOL 0.3.0: Replaced % 2 with Math.modX.
        if (Math.modX($nIndex, 2) === 1) {
            $nWeight = 3;
        }
        $nSum = $nSum + ($nDigit * $nWeight);
    }

    // Step 3: the check digit (13th digit) must bring the total to a
    // multiple of 10.
    const $nCheckDigit = Cast.toInt(Str.sub($sDigits, 12, 1));
    // JSOL 0.3.0: Replaced % 10 with Math.modX.
    return Math.modX(($nSum + $nCheckDigit), 10) === 0;
};