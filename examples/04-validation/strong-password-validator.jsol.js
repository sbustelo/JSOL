// @JSOL v0.2.97

/**
 @description
 Checks whether $sPassword meets a common strength policy: at least 8
 characters, and at least one uppercase letter, one lowercase letter, one
 digit, and one symbol (any character that is not a letter or digit).
 Walks the string once, tracking which requirements have been satisfied
 so far, instead of four separate passes.
  Implemented with Str.* and manual ASCII range checks rather than
 Regex.*: this keeps the example free of the fast/safe regex parity
 question entirely, the same choice made in luhn-validator.jsol.js.

@param {string} $sPassword - The password to check.
@returns {boolean} - True if every requirement is met.
*/

/**
 @contract
 {
   "cases": [
     { "$sPassword": "Kambrica2026!" },
     { "$sPassword": "weakpass" },
     { "$sPassword": "SHORT1!" }
   ]
 }
*/

const $bValidateStrongPassword = function($sPassword) {
    const $nLen = Str.len($sPassword);
    if ($nLen < 8) {
        return false;
    }

    let $bHasUpper = false;
    let $bHasLower = false;
    let $bHasDigit = false;
    let $bHasSymbol = false;

    for (let $nIndex = 0; $nIndex < $nLen; $nIndex = $nIndex + 1) {
        const $nCode = Str.char($sPassword, $nIndex);

        if ($nCode >= 65 && $nCode <= 90) {
            // 'A'-'Z'
            $bHasUpper = true;
        } else if ($nCode >= 97 && $nCode <= 122) {
            // 'a'-'z'
            $bHasLower = true;
        } else if ($nCode >= 48 && $nCode <= 57) {
            // '0'-'9'
            $bHasDigit = true;
        } else {
            // Anything outside letters and digits counts as a symbol.
            $bHasSymbol = true;
        }
    }

    return $bHasUpper && $bHasLower && $bHasDigit && $bHasSymbol;
};