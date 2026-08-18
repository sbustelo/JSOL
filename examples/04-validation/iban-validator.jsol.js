// @JSOL v0.2.91

/**
 @description
 Validates an IBAN (International Bank Account Number) using the ISO
 13616 mod-97 checksum: move the first 4 characters to the end, convert
 every letter to its numeric value (A=10, B=11, ... Z=35), and the
 resulting numeric string must be congruent to 1 mod 97.
  That numeric string routinely runs 30+ digits long, far past what a
 64-bit float represents exactly (see digit-sum.jsol.js in 01-basics for
 the same lesson). It is never cast to a number here: the mod-97 is
 computed digit by digit instead, folding each new digit into a running
 remainder as (remainder * 10 + digit) mod 97. That is mathematically
 equivalent to computing the mod of the full number, but never needs a
 variable large enough to hold it.

@param {string} $sIban - IBAN to validate, may contain spaces.
@returns {boolean} - True if $sIban passes the mod-97 checksum.
*/

/**
 @contract
 {
   "cases": [
     { "$sIban": "GB29 NWBK 6016 1331 9268 19" },
     { "$sIban": "GB29 NWBK 6016 1331 9268 18" }
   ]
 }
*/

const $bValidateIban = function($sIban) {
    // Step 1: strip spaces, uppercase for consistent letter comparison.
    const $iRawLen = Str.len($sIban);
    let $sClean = "";
    for (let $i = 0; $i < $iRawLen; $i = $i + 1) {
        const $sChar = Str.sub($sIban, $i, 1);
        if ($sChar !== " ") {
            $sClean = $sClean + $sChar;
        }
    }
    $sClean = Str.upper($sClean);

    const $iLen = Str.len($sClean);
    if ($iLen < 5) {
        return false;
    }

    // Step 2: move the first 4 characters to the end.
    const $sFirstFour = Str.sub($sClean, 0, 4);
    const $sRest = Str.sub($sClean, 4, $iLen - 4);
    const $sRearranged = $sRest + $sFirstFour;

    // Step 3: walk the rearranged string, folding each character's numeric
    // contribution into a running mod-97 remainder.
    const $iRearrangedLen = Str.len($sRearranged);
    let $qRemainder = 0;

    for (let $i = 0; $i < $iRearrangedLen; $i = $i + 1) {
        const $qCode = Str.char($sRearranged, $i);

        if ($qCode >= 48 && $qCode <= 57) {
            // '0'-'9': use the digit directly.
            const $qDigit = $qCode - 48;
            $qRemainder = ($qRemainder * 10 + $qDigit) % 97;
        } else if ($qCode >= 65 && $qCode <= 90) {
            // 'A'-'Z': letter value is 10-35, two digits, folded in as two
            // separate steps.
            const $qLetterValue = $qCode - 55;
            const $qTens = Math.floor($qLetterValue / 10);
            const $qUnits = $qLetterValue % 10;
            $qRemainder = ($qRemainder * 10 + $qTens) % 97;
            $qRemainder = ($qRemainder * 10 + $qUnits) % 97;
        } else {
            // Anything that isn't a digit or an uppercase letter means
            // $sIban was never validly formatted to begin with.
            return false;
        }
    }

    return $qRemainder === 1;
};
