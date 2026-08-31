// @JSOL v0.2.97

/**
 @description
 Checks whether $sEmail has the basic shape of a valid email address: one
 or more non-space characters, an "@", and a domain containing at least
 one dot. This is a structural check, not a deliverability check: it does
 not verify the mailbox exists, only that the string could plausibly be
 an email address.

@param {string} $sEmail - The string to validate.
@returns {boolean} - True if $sEmail matches the expected shape.
*/

/**
 @contract
 {
   "cases": [
     { "$sEmail": "jsol@example.com" },
     { "$sEmail": "not-an-email" },
     { "$sEmail": "missing@domain" }
   ]
 }
*/

// @UNVERIFIED-PARITY: Regex.test compiles to each target's native regex
// engine ("fast" mode), not the pure-JSOL Thompson NFA engine. JS and PHP
// regex flavors can diverge on edge cases this pattern has not been
// cross-checked against yet (Priority 6 contract runner pending). This
// example exists specifically to demonstrate Regex.*, unlike
// luhn-validator.jsol.js or iban-validator.jsol.js, which avoid it.
const $bValidateEmail = function($sEmail) {
    return Regex.test("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", $sEmail, "");
};