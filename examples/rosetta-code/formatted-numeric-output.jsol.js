// @JSOL v0.2.97

/**
 @description
 Rosetta Code task: https://rosettacode.org/wiki/Formatted_numeric_output
 — the task, read narrowly, is just: express a number in decimal as a
 fixed-length string with leading zeros (e.g. `7.125` -> `"00007.125"`).

 Formats `$nValue` as a fixed-length decimal string: rounds to
 `$qDecimalPlaces` decimal places, then zero-pads the integer part on the
 left until the whole string (sign included) is exactly `$qTotalWidth`
 characters long, e.g. `$sFormatFixedWidth(7.125, 9, 3)` -> `"00007.125"`.

 A negative `$nValue` keeps its sign in front of the zero-padding, e.g.
 `$sFormatFixedWidth(-7.125, 9, 3)` -> `"-0007.125"` (the sign occupies
 one of the `$qTotalWidth` characters).

@param {number} $nValue - The number to format. May be negative.
@param {integer} $qTotalWidth - Minimum total length of the result,
   including the sign (if negative) and the decimal point.
@param {integer} $qDecimalPlaces - How many digits to keep after the
   decimal point. 0 omits the decimal point entirely.
@returns {string} - The zero-padded, fixed-width representation.
*/

/**
 @contract
 {
   "cases": [
     { "$nValue": 7.125, "$qTotalWidth": 9, "$qDecimalPlaces": 3 },
     { "$nValue": -7.125, "$qTotalWidth": 9, "$qDecimalPlaces": 3 },
     { "$nValue": 42, "$qTotalWidth": 6, "$qDecimalPlaces": 0 }
   ]
 }
*/

const $sFormatFixedWidth = function($nValue, $qTotalWidth, $qDecimalPlaces) {
    let $bNegative = false;
    let $nAbs = $nValue;
    if ($nValue < 0) {
        $bNegative = true;
        $nAbs = -1 * $nValue;
    }

    const $nScale = Math.pow(10, $qDecimalPlaces);
    const $nRounded = Math.roundX($nAbs * $nScale) / $nScale;
    const $nIntegerPart = Math.floor($nRounded);
    const $nFractionPart = Math.roundX(($nRounded - $nIntegerPart) * $nScale);

    let $sBody = Cast.toStr($nIntegerPart);

    if ($qDecimalPlaces > 0) {
        let $sFraction = Cast.toStr($nFractionPart);
        while (Str.len($sFraction) < $qDecimalPlaces) {
            $sFraction = "0" + $sFraction;
        }
        $sBody = $sBody + "." + $sFraction;
    }

    let $sSign = "";
    if ($bNegative === true) {
        $sSign = "-";
    }

    // Zero-pad the integer part on the left until sign + body reaches
    // $qTotalWidth.
    while (Str.len($sSign + $sBody) < $qTotalWidth) {
        $sBody = "0" + $sBody;
    }

    return $sSign + $sBody;
};
