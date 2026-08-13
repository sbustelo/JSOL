// @JSOL v0.2.91

/**
 * @description
 * Counts how many characters in $sText are vowels (a, e, i, o, u),
 * case-insensitive. Walks the string once, comparing each lowercased
 * character against the fixed vowel set.
 *
 * @param {string} $sText - The text to scan.
 * @returns {integer} - Number of vowel characters found.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$sText": "Hello World" },
 *     { "$sText": "xyz" }
 *   ]
 * }
 */

const $qCountVowels = function($sText) {
    const $sLower = Str.lower($sText);
    const $iLen = Str.len($sLower);
    let $qCount = 0;

    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        const $sChar = Str.sub($sLower, $i, 1);
        if ($sChar === "a" || $sChar === "e" || $sChar === "i" || $sChar === "o" || $sChar === "u") {
            $qCount = $qCount + 1;
        }
    }

    return $qCount;
};
