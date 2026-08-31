// @JSOL v0.2.97

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
    const $nRawLen = Str.len($sIban);
    let $sClean = "";
    for (let $nIndex = 0; $nIndex < $nRawLen; $nIndex = $nIndex + 1) {
        const $sChar = Str.sub($sIban, $nIndex, 1);
        if ($sChar !== " ") {
            $sClean = $sClean + $sChar;
        }
    }
    $sClean = Str.upper($sClean);

    const $nLen = Str.len($sClean);
    if ($nLen < 5) {
        return false;
    }

    // Step 2: move the first 4 characters to the end.
    const $sFirstFour = Str.sub($sClean, 0, 4);
    const $sRest = Str.sub($sClean, 4, $nLen - 4);
    const $sRearranged = $sRest + $sFirstFour;

    // Step 3: walk the rearranged string, folding each character's numeric
    // contribution into a running mod-97 remainder.
    const $nRearrangedLen = Str.len($sRearranged);
    let $nRemainder = 0;

    for (let $nIndex = 0; $nIndex < $nRearrangedLen; $nIndex = $nIndex + 1) {
        const $nCode = Str.char($sRearranged, $nIndex);

        if ($nCode >= 48 && $nCode <= 57) {
            // '0'-'9': use the digit directly.
            const $nDigit = $nCode - 48;
            // JSOL 0.3.0: Uses Math.modX instead of % 97 for exact cross-target evaluation.
            $nRemainder = Math.modX(($nRemainder * 10 + $nDigit), 97);
        } else if ($nCode >= 65 && $nCode <= 90) {
            // 'A'-'Z': letter value is 10-35, two digits, folded in as two
            // separate steps.
            const $nLetterValue = $nCode - 55;
            const $nTens = Math.floor($nLetterValue / 10);
            const $nUnits = Math.modX($nLetterValue, 10);
            $nRemainder = Math.modX(($nRemainder * 10 + $nTens), 97);
            $nRemainder = Math.modX(($nRemainder * 10 + $nUnits), 97);
        } else {
            // Anything that isn't a digit or an uppercase letter means
            // $sIban was never validly formatted to begin with.
            return false;
        }
    }

    return $nRemainder === 1;
};