// @JSOL v0.2.91

/**
 * @description
 * Validates an Argentine CUIT/CUIL (tax identification number) using its
 * mod-11 checksum. The first 10 digits (2-digit type prefix + 8-digit
 * document number) are each multiplied by a fixed weight
 * [5,4,3,2,7,6,5,4,3,2], the products summed, and the check digit derived
 * from 11 minus the sum's remainder mod 11 (a remainder of 0 folds the
 * check digit to 0). A remainder that would require a check digit of 10
 * means no valid CUIT exists for that base number at all.
 *
 * The example CUIT below is constructed to satisfy this checksum, it is
 * not asserted to belong to any real registered taxpayer.
 *
 * @param {string} $sCuit - CUIT/CUIL, may contain dashes (format XX-XXXXXXXX-X).
 * @returns {boolean} - True if $sCuit passes the mod-11 checksum.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$sCuit": "20-11111111-2" },
 *     { "$sCuit": "20-11111111-0" }
 *   ]
 * }
 */

const $bValidateCuit = function($sCuit) {
    // Step 1: keep only ASCII digits.
    const $iRawLen = Str.len($sCuit);
    let $sDigits = "";
    for (let $i = 0; $i < $iRawLen; $i = $i + 1) {
        const $qCode = Str.char($sCuit, $i);
        if ($qCode >= 48 && $qCode <= 57) {
            $sDigits = $sDigits + Str.sub($sCuit, $i, 1);
        }
    }

    if (Str.len($sDigits) !== 11) {
        return false;
    }

    // Step 2: weighted sum over the first 10 digits.
    const $aWeights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let $qSum = 0;
    for (let $i = 0; $i < 10; $i = $i + 1) {
        const $qDigit = Cast.toInt(Str.sub($sDigits, $i, 1));
        $qSum = $qSum + ($qDigit * $aWeights[$i]);
    }

    // Step 3: derive the expected check digit from the remainder.
    const $qRemainder = $qSum % 11;
    let $qExpectedCheck = 11 - $qRemainder;
    if ($qExpectedCheck === 11) {
        $qExpectedCheck = 0;
    }
    if ($qExpectedCheck === 10) {
        // No valid CUIT exists for this base number.
        return false;
    }

    const $qActualCheck = Cast.toInt(Str.sub($sDigits, 10, 1));
    return $qActualCheck === $qExpectedCheck;
};
