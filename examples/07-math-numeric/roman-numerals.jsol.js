// @JSOL v0.2.91

/**
 @description
 Converts a positive integer $qN (1-3999) to its Roman numeral
 representation. Walks a table of value/symbol pairs from largest to
 smallest, including the "subtractive" pairs (900 -> "CM", 400 -> "CD",
 etc.), repeatedly subtracting the largest value that still fits and
 appending its symbol — the same process a Roman scribe would follow.
  3999 is the practical upper bound: Roman numerals have no standard
 symbol for 4000 or beyond without notation conventions (an overline
 meaning "times 1000") outside the scope of this example.

@param {integer} $qN - Integer from 1 to 3999.
@returns {string} - The Roman numeral representation of $qN.
*/

/**
 @contract
 {
   "cases": [
     { "$qN": 1994 },
     { "$qN": 58 }
   ]
 }
*/

const $sToRomanNumeral = function($qN) {
    // Parallel arrays: $aValues[$i] pairs with $aSymbols[$i]. Includes the
    // subtractive combinations (900, 400, 90, 40, 9, 4) alongside the
    // plain ones, so a single pass never needs special-case logic for them.
    const $aValues = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const $aSymbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];

    let $qRemaining = $qN;
    let $sResult = "";

    for (let $i = 0; $i < 13; $i = $i + 1) {
        while ($qRemaining >= $aValues[$i]) {
            $sResult = $sResult + $aSymbols[$i];
            $qRemaining = $qRemaining - $aValues[$i];
        }
    }

    return $sResult;
};