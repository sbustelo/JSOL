// @JSOL v0.2.91

/**
 @description
 Checks whether $sText reads the same forwards and backwards, comparing a
 character from the start against a character from the end and working
 inward. Comparison is case-sensitive and does not skip spaces or
 punctuation; callers who want "a man, a plan, a canal, Panama" style
 matching should normalize $sText before calling this function.

@param {string} $sText - The text to test.
@returns {boolean} - True if $sText is a palindrome, false otherwise.
*/

/**
 @contract
 {
   "cases": [
     { "$sText": "level" },
     { "$sText": "hello" },
     { "$sText": "" }
   ]
 }
*/

const $bIsPalindrome = function($sText) {
    const $iLen = Str.len($sText);

    // Two pointers moving toward the middle from opposite ends.
    let $iLeft = 0;
    let $iRight = $iLen - 1;

    while ($iLeft < $iRight) {
        if (Str.sub($sText, $iLeft, 1) !== Str.sub($sText, $iRight, 1)) {
            return false;
        }
        $iLeft = $iLeft + 1;
        $iRight = $iRight - 1;
    }

    return true;
};
