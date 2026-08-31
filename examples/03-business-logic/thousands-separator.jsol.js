// @JSOL v0.2.97

/**
 @description
 Formats a number with a thousands separator inserted every 3 digits of
 the integer part, e.g. 1234567.5 with "," -> "1,234,567.50". Built as a
 manual right-to-left string walk over the integer digits: this is the
 same "insert a marker every N characters" pattern behind most number
 formatting routines, spelled out instead of hidden behind a library call.

@param {number} $nAmount - The number to format. May be negative.
@param {string} $sSeparator - Character inserted between thousands groups (e.g. ",").
@returns {string} - The formatted number, always with exactly 2 decimal places.
*/

/**
 @contract
 {
   "cases": [
     { "$nAmount": 1234567.5, "$sSeparator": "," },
     { "$nAmount": -980, "$sSeparator": "." },
     { "$nAmount": 42, "$sSeparator": "," }
   ]
 }
*/

const $sFormatThousands = function($nAmount, $sSeparator) {
    let $bNegative = false;
    let $nAbsAmount = $nAmount;
    if ($nAmount < 0) {
        $bNegative = true;
        $nAbsAmount = -1 * $nAmount;
    }

    // Round to 2 decimals first using Math.roundX (half away from zero), 
    // then split into the integer part and the cents.
    const $nRounded = Math.roundX($nAbsAmount * 100) / 100;
    const $nIntegerPart = Math.floor($nRounded);
    const $nCents = Math.roundX(($nRounded - $nIntegerPart) * 100);

    const $sDigits = Cast.toStr($nIntegerPart);
    const $nLen = Str.len($sDigits);

    // Walk the integer digits right to left, inserting the separator every
    // 3 digits, building the result backwards.
    let $sReversedGrouped = "";
    for (let $nIndex = 0; $nIndex < $nLen; $nIndex = $nIndex + 1) {
        const $sChar = Str.sub($sDigits, $nLen - 1 - $nIndex, 1);
        // JSOL 0.3.0: Uses Math.modX instead of % to check position boundaries.
        if ($nIndex > 0 && Math.modX($nIndex, 3) === 0) {
            $sReversedGrouped = $sReversedGrouped + $sSeparator;
        }
        $sReversedGrouped = $sReversedGrouped + $sChar;
    }

    // Reverse it back into normal left-to-right reading order.
    let $sGroupedInteger = "";
    const $nGroupedLen = Str.len($sReversedGrouped);
    for (let $nIndex = 0; $nIndex < $nGroupedLen; $nIndex = $nIndex + 1) {
        $sGroupedInteger = $sGroupedInteger + Str.sub($sReversedGrouped, $nGroupedLen - 1 - $nIndex, 1);
    }

    // Cents always shown as 2 digits, zero-padded on the left if needed.
    let $saCentsStr = Cast.toStr($nCents);
    if (Str.len($saCentsStr) === 1) {
        $saCentsStr = "0" + $saCentsStr;
    }

    let $sSign = "";
    if ($bNegative === true) {
        $sSign = "-";
    }

    return $sSign + $sGroupedInteger + "." + $saCentsStr;
};