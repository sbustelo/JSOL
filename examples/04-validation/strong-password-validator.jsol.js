// @JSOL v0.2.91

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
    const $iLen = Str.len($sPassword);
    if ($iLen < 8) {
        return false;
    }

    let $bHasUpper = false;
    let $bHasLower = false;
    let $bHasDigit = false;
    let $bHasSymbol = false;

    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        const $qCode = Str.char($sPassword, $i);

        if ($qCode >= 65 && $qCode <= 90) {
            // 'A'-'Z'
            $bHasUpper = true;
        } else if ($qCode >= 97 && $qCode <= 122) {
            // 'a'-'z'
            $bHasLower = true;
        } else if ($qCode >= 48 && $qCode <= 57) {
            // '0'-'9'
            $bHasDigit = true;
        } else {
            // Anything outside letters and digits counts as a symbol.
            $bHasSymbol = true;
        }
    }

    return $bHasUpper && $bHasLower && $bHasDigit && $bHasSymbol;
};
