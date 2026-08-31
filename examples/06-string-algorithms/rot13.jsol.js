// @JSOL v0.2.97

/**
 @description
 Applies ROT13, the special case of the Caesar cipher with a fixed shift
 of 13. Because the alphabet has 26 letters, applying ROT13 twice returns
 the original text; the same function is therefore its own inverse,
 which is why it became a popular convention for obscuring text
 (spoilers, puzzle answers) without real cryptographic strength.

@param {string} $sText - Text to transform.
@returns {string} - The ROT13-transformed text.
*/

/**
 @contract
 {
   "cases": [
     { "$sText": "Hello, World!" }
   ]
 }
*/

const $sRot13 = function($sText) {
    const $nLen = Str.len($sText);
    let $sResult = "";

    for (let $nIndex = 0; $nIndex < $nLen; $nIndex = $nIndex + 1) {
        const $nCode = Str.char($sText, $nIndex);

        if ($nCode >= 65 && $nCode <= 90) {
            // JSOL 0.3.0: Replaced % 26 with Math.modX for exact isomorphic execution.
            $sResult = $sResult + Str.fromChar(Math.modX(($nCode - 65 + 13), 26) + 65);
        } else if ($nCode >= 97 && $nCode <= 122) {
            $sResult = $sResult + Str.fromChar(Math.modX(($nCode - 97 + 13), 26) + 97);
        } else {
            $sResult = $sResult + Str.sub($sText, $nIndex, 1);
        }
    }

    return $sResult;
};