// @JSOL v0.2.97

/**
 @description
 Validates an Argentine CUIT/CUIL (tax identification number) using its
 mod-11 checksum. The first 10 digits (2-digit type prefix + 8-digit
 document number) are each multiplied by a fixed weight
 [5,4,3,2,7,6,5,4,3,2], the products summed, and the check digit derived
 from 11 minus the sum's remainder mod 11 (a remainder of 0 folds the
 check digit to 0). A remainder that would require a check digit of 10
 means no valid CUIT exists for that base number at all.
  The example CUIT below is constructed to satisfy this checksum, it is
 not asserted to belong to any real registered taxpayer.

@param {string} $sCuit - CUIT/CUIL, may contain dashes (format XX-XXXXXXXX-X).
@returns {boolean} - True if $sCuit passes the mod-11 checksum.
*/

/**
 @contract
 {
   "cases": [
     { "$sCuit": "20-11111111-2" },
     { "$sCuit": "20-11111111-0" }
   ]
 }
*/

const $bValidateCuit = function($sCuit) {
    // Step 1: keep only ASCII digits.
    const $nRawLen = Str.len($sCuit);
    let $sDigits = "";
    for (let $nIndex = 0; $nIndex < $nRawLen; $nIndex = $nIndex + 1) {
        const $nCode = Str.char($sCuit, $nIndex);
        if ($nCode >= 48 && $nCode <= 57) {
            $sDigits = $sDigits + Str.sub($sCuit, $nIndex, 1);
        }
    }

    if (Str.len($sDigits) !== 11) {
        return false;
    }

    // Step 2: weighted sum over the first 10 digits.
    const $aWeights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let $nSum = 0;
    for (let $nIndex = 0; $nIndex < 10; $nIndex = $nIndex + 1) {
        const $nDigit = Cast.toInt(Str.sub($sDigits, $nIndex, 1));
        $nSum = $nSum + ($nDigit * $aWeights[$nIndex]);
    }

    // Step 3: derive the expected check digit from the remainder.
    // JSOL 0.3.0: Uses Math.modX for deterministic mod-11 calculation across all targets.
    const $nRemainder = Math.modX($nSum, 11);
    let $nExpectedCheck = 11 - $nRemainder;
    if ($nExpectedCheck === 11) {
        $nExpectedCheck = 0;
    }
    if ($nExpectedCheck === 10) {
        // No valid CUIT exists for this base number.
        return false;
    }

    const $nActualCheck = Cast.toInt(Str.sub($sDigits, 10, 1));
    return $nActualCheck === $nExpectedCheck;
};