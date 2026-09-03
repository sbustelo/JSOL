// @JSOL v0.2.97

/**
 @description
 Rosetta Code task: https://rosettacode.org/wiki/Count_how_many_vowels_and_consonants_occur_in_a_string
 — the task asks for both counts (vowels and consonants), not vowels
 alone.

 Counts how many characters in `$sText` are vowels (a, e, i, o, u) and
 how many are consonants (any other letter a-z), case-insensitive. Walks
 the string once, lowercases each character, and classifies it as vowel,
 consonant, or neither (digits, spaces, punctuation are counted as
 neither and ignored, matching the task's own examples).

@param {string} $sText - The text to scan.
@returns {Map} - "vowels" (count) and "consonants" (count).
*/

/**
 @contract
 {
   "cases": [
     { "$sText": "Now is the time for all good men to come to the aid of their country." },
     { "$sText": "xyz" }
   ]
 }
*/

const $mCountVowelsAndConsonants = function($sText) {
    const $sLower = Str.lower($sText);
    const $qLen = Str.len($sLower);
    let $qVowels = 0;
    let $qConsonants = 0;

    for (let $i = 0; $i < $qLen; $i = $i + 1) {
        const $sChar = Str.sub($sLower, $i, 1);
        const $qCode = Str.char($sLower, $i);
        const $bIsLetter = $qCode >= 97 && $qCode <= 122;
        const $bIsVowel = $sChar === "a" || $sChar === "e" || $sChar === "i" || $sChar === "o" || $sChar === "u";

        if ($bIsVowel) {
            $qVowels = $qVowels + 1;
        } else if ($bIsLetter) {
            $qConsonants = $qConsonants + 1;
        }
    }

    return Map.create("vowels", $qVowels, "consonants", $qConsonants);
};
