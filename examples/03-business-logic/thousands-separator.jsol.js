// @JSOL v0.2.91

/**
 * @description
 * Formats a number with a thousands separator inserted every 3 digits of
 * the integer part, e.g. 1234567.5 with "," -> "1,234,567.50". Built as a
 * manual right-to-left string walk over the integer digits: this is the
 * same "insert a marker every N characters" pattern behind most number
 * formatting routines, spelled out instead of hidden behind a library call.
 *
 * @param {number} $nAmount - The number to format. May be negative.
 * @param {string} $sSeparator - Character inserted between thousands groups (e.g. ",").
 * @returns {string} - The formatted number, always with exactly 2 decimal places.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$nAmount": 1234567.5, "$sSeparator": "," },
 *     { "$nAmount": -980, "$sSeparator": "." },
 *     { "$nAmount": 42, "$sSeparator": "," }
 *   ]
 * }
 */

const $sFormatThousands = function($nAmount, $sSeparator) {
    let $bNegative = false;
    let $nAbsAmount = $nAmount;
    if ($nAmount < 0) {
        $bNegative = true;
        $nAbsAmount = -1 * $nAmount;
    }

    // Round to 2 decimals first (same multiply-round-divide pattern as
    // invoice-tax-rounding.jsol.js in 02-finance), then split into the
    // integer part and the cents.
    const $nRounded = Math.round($nAbsAmount * 100) / 100;
    const $qIntegerPart = Math.floor($nRounded);
    const $qCents = Math.round(($nRounded - $qIntegerPart) * 100);

    const $sDigits = Cast.toStr($qIntegerPart);
    const $iLen = Str.len($sDigits);

    // Walk the integer digits right to left, inserting the separator every
    // 3 digits, building the result backwards.
    let $sReversedGrouped = "";
    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        const $sChar = Str.sub($sDigits, $iLen - 1 - $i, 1);
        if ($i > 0 && $i % 3 === 0) {
            $sReversedGrouped = $sReversedGrouped + $sSeparator;
        }
        $sReversedGrouped = $sReversedGrouped + $sChar;
    }

    // Reverse it back into normal left-to-right reading order.
    let $sGroupedInteger = "";
    const $iGroupedLen = Str.len($sReversedGrouped);
    for (let $i = 0; $i < $iGroupedLen; $i = $i + 1) {
        $sGroupedInteger = $sGroupedInteger + Str.sub($sReversedGrouped, $iGroupedLen - 1 - $i, 1);
    }

    // Cents always shown as 2 digits, zero-padded on the left if needed.
    let $sCents = Cast.toStr($qCents);
    if (Str.len($sCents) === 1) {
        $sCents = "0" + $sCents;
    }

    let $sSign = "";
    if ($bNegative === true) {
        $sSign = "-";
    }

    return $sSign + $sGroupedInteger + "." + $sCents;
};
