// @JSOL v0.2.91

/**
 @description
 Normalizes a phone number to a consistent "+<digits>" form: keeps a
 leading "+" if present, strips everything else that is not a digit
 (spaces, dashes, parentheses, dots). Does not validate the number
 itself (length, real country code), only reshapes formatting variance
 into one consistent representation.
  Implemented with a manual character scan rather than Regex.*: filtering
 down to a fixed character set is the same class of problem as
 luhn-validator.jsol.js and iban-validator.jsol.js, not a genuine regex
 use case. See slug-generator.jsol.js in this same folder for a problem
 where Regex.* actually earns its place.

@param {string} $sPhone - Phone number in any common formatting.
@returns {string} - Normalized phone number, digits only, with an
   optional leading "+".
*/

/**
 @contract
 {
   "cases": [
     { "$sPhone": "+54 (11) 4555-1234" },
     { "$sPhone": "011-4555.1234" }
   ]
 }
*/

const $sNormalizePhone = function($sPhone) {
    let $sLeadingPlus = "";
    if (Str.sub($sPhone, 0, 1) === "+") {
        $sLeadingPlus = "+";
    }

    const $iLen = Str.len($sPhone);
    let $sDigitsOnly = "";
    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        const $qCode = Str.char($sPhone, $i);
        if ($qCode >= 48 && $qCode <= 57) {
            $sDigitsOnly = $sDigitsOnly + Str.sub($sPhone, $i, 1);
        }
    }

    return $sLeadingPlus + $sDigitsOnly;
};
