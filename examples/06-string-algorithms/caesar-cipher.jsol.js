// @JSOL v0.2.91

/**
 * @description
 * Encrypts $sText with a Caesar cipher: every letter is shifted
 * $qShift positions through the alphabet, wrapping from 'z' back to 'a'.
 * One of the oldest ciphers on record (attributed to Julius Caesar for
 * military correspondence); trivially breakable today, but still the
 * clearest introduction to modular arithmetic applied to text: the wrap-
 * around is exactly (position + shift) mod 26.
 *
 * Only ASCII letters are shifted; digits, spaces, and punctuation pass
 * through unchanged, and case is preserved.
 *
 * @param {string} $sText - Text to encrypt.
 * @param {integer} $qShift - Number of positions to shift each letter (0-25).
 * @returns {string} - The encrypted text.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$sText": "Hello, World!", "$qShift": 3 },
 *     { "$sText": "xyz", "$qShift": 5 }
 *   ]
 * }
 */

const $sCaesarCipher = function($sText, $qShift) {
    const $iLen = Str.len($sText);
    let $sResult = "";

    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        const $qCode = Str.char($sText, $i);

        if ($qCode >= 65 && $qCode <= 90) {
            // Uppercase 'A'-'Z': shift within this 26-letter block.
            const $qShifted = (($qCode - 65 + $qShift) % 26) + 65;
            $sResult = $sResult + Str.fromChar($qShifted);
        } else if ($qCode >= 97 && $qCode <= 122) {
            // Lowercase 'a'-'z': shift within this 26-letter block.
            const $qShifted = (($qCode - 97 + $qShift) % 26) + 97;
            $sResult = $sResult + Str.fromChar($qShifted);
        } else {
            // Anything else (digits, spaces, punctuation) is unchanged.
            $sResult = $sResult + Str.sub($sText, $i, 1);
        }
    }

    return $sResult;
};
