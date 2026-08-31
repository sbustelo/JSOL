// @JSOL v0.2.97

/**
 @description
 Encrypts $sText with a Caesar cipher: every letter is shifted
 $nShift positions through the alphabet, wrapping from 'z' back to 'a'.
 One of the oldest ciphers on record (attributed to Julius Caesar for
 military correspondence); trivially breakable today, but still the
 clearest introduction to modular arithmetic applied to text: the wrap-
 around is exactly (position + shift) mod 26.
  Only ASCII letters are shifted; digits, spaces, and punctuation pass
 through unchanged, and case is preserved.

@param {string} $sText - Text to encrypt.
@param {number} $nShift - Number of positions to shift each letter (0-25).
@returns {string} - The encrypted text.
*/

/**
 @contract
 {
   "cases": [
     { "$sText": "Hello, World!", "$nShift": 3 },
     { "$sText": "xyz", "$nShift": 5 }
   ]
 }
*/

const $sCaesarCipher = function($sText, $nShift) {
    const $nLen = Str.len($sText);
    let $sResult = "";

    for (let $nIndex = 0; $nIndex < $nLen; $nIndex = $nIndex + 1) {
        const $nCode = Str.char($sText, $nIndex);

        if ($nCode >= 65 && $nCode <= 90) {
            // JSOL 0.3.0: Uses Math.modX instead of % 26 for cross-target determinism.
            const $nShifted = Math.modX(($nCode - 65 + $nShift), 26) + 65;
            $sResult = $sResult + Str.fromChar($nShifted);
        } else if ($nCode >= 97 && $nCode <= 122) {
            // Lowercase 'a'-'z': shift within this 26-letter block using Math.modX.
            const $nShifted = Math.modX(($nCode - 97 + $nShift), 26) + 97;
            $sResult = $sResult + Str.fromChar($nShifted);
        } else {
            // Anything else (digits, spaces, punctuation) is unchanged.
            $sResult = $sResult + Str.sub($sText, $nIndex, 1);
        }
    }

    return $sResult;
};