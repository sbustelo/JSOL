// @JSOL v0.2.97

/**
 @description
 Converts a non-negative integer $nN to its binary representation, using
 repeated division by 2: the remainder of each division (0 or 1) is the
 next binary digit, produced from least significant to most significant,
 so the digits are collected in reverse order and flipped at the end.

@param {number} $nN - Non-negative integer.
@returns {string} - Binary representation of $nN, no leading zeros
   (except the input 0, which returns "0").
*/

/**
 @contract
 {
   "cases": [
     { "$nN": 13 },
     { "$nN": 0 }
   ]
 }
*/

const $sDecimalToBinary = function($nN) {
    if ($nN === 0) {
        return "0";
    }

    let $nRemaining = $nN;
    let $sReversedBinary = "";

    while ($nRemaining > 0) {
        // JSOL 0.3.0: Uses Math.modX for exact modulo evaluation.
        const $nRemainder = Math.modX($nRemaining, 2);
        $sReversedBinary = $sReversedBinary + Cast.toStr($nRemainder);
        $nRemaining = Math.floor($nRemaining / 2);
    }

    // Digits were collected least-significant-first; reverse to get the
    // normal reading order.
    const $nLen = Str.len($sReversedBinary);
    let $sBinary = "";
    for (let $nIndex = 0; $nIndex < $nLen; $nIndex = $nIndex + 1) {
        $sBinary = $sBinary + Str.sub($sReversedBinary, $nLen - 1 - $nIndex, 1);
    }

    return $sBinary;
};