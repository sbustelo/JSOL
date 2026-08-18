// @JSOL v0.2.91

/**
 @description
 Converts a non-negative integer $qN to its binary representation, using
 repeated division by 2: the remainder of each division (0 or 1) is the
 next binary digit, produced from least significant to most significant,
 so the digits are collected in reverse order and flipped at the end.

@param {integer} $qN - Non-negative integer.
@returns {string} - Binary representation of $qN, no leading zeros
   (except the input 0, which returns "0").
*/

/**
 @contract
 {
   "cases": [
     { "$qN": 13 },
     { "$qN": 0 }
   ]
 }
*/

const $sDecimalToBinary = function($qN) {
    if ($qN === 0) {
        return "0";
    }

    let $qRemaining = $qN;
    let $sReversedBinary = "";

    while ($qRemaining > 0) {
        const $qRemainder = $qRemaining % 2;
        $sReversedBinary = $sReversedBinary + Cast.toStr($qRemainder);
        $qRemaining = Math.floor($qRemaining / 2);
    }

    // Digits were collected least-significant-first; reverse to get the
    // normal reading order.
    const $iLen = Str.len($sReversedBinary);
    let $sBinary = "";
    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        $sBinary = $sBinary + Str.sub($sReversedBinary, $iLen - 1 - $i, 1);
    }

    return $sBinary;
};