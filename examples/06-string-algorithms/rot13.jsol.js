// @JSOL v0.2.91

/**
 * @description
 * Applies ROT13, the special case of the Caesar cipher with a fixed shift
 * of 13. Because the alphabet has 26 letters, applying ROT13 twice returns
 * the original text; the same function is therefore its own inverse,
 * which is why it became a popular convention for obscuring text
 * (spoilers, puzzle answers) without real cryptographic strength.
 *
 * @param {string} $sText - Text to transform.
 * @returns {string} - The ROT13-transformed text.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$sText": "Hello, World!" }
 *   ]
 * }
 */

const $sRot13 = function($sText) {
    const $iLen = Str.len($sText);
    let $sResult = "";

    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        const $qCode = Str.char($sText, $i);

        if ($qCode >= 65 && $qCode <= 90) {
            $sResult = $sResult + Str.fromChar((($qCode - 65 + 13) % 26) + 65);
        } else if ($qCode >= 97 && $qCode <= 122) {
            $sResult = $sResult + Str.fromChar((($qCode - 97 + 13) % 26) + 97);
        } else {
            $sResult = $sResult + Str.sub($sText, $i, 1);
        }
    }

    return $sResult;
};
