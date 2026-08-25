// @JSOL v0.2.91

/**
 @description

 # Validate Luhn
 Validates a card number using the **Luhn algorithm** (modulus 10 algorithm).
 This checksum formula is used to validate various identification numbers,
 primarily credit card numbers.
 
 - **@param {string} $sCardNumber** - The card number to validate (may contain spaces, dashes, etc.)
- **@returns {boolean}** - True if the card number passes the Luhn check, false otherwise.
 
 ## Standard Test Card Examples
 
 ### Visa
 - `4509 9535 6623 3704`
 - `4000 6200 0000 0007`
 
 ### Mastercard
 - `5555 5555 5555 4444`
 - `5031 7557 3453 0604`
 
 ### American Express
 - `3700 000000 00002`
 - `3711 803032 57522`
 
 ### Diners Club
 - `3600 6666 3333 44`
 
 ## Sources
 - [Mercado Pago Test Cards](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/test/cards)
 - [Adyen Test Card Numbers](https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers)

 */

// The @contract block specifies test cases and default values for the REPL.
// The "in" and "expect" wrappers are optional; a test case can state input parameters directly:
/**
 @contract
 {
   "cases": [
     { "$sCardNumber": "4509 9535 6623 3704" },
     { "$sCardNumber": "4509 9535 6623 3705" },
     { "$sCardNumber": "1234" }
   ]
 }
*/

const $bValidateLuhn = function($sCardNumber) {

    // Step 1: keep only ASCII digits (0-9). Walked manually with Str.* instead
    // of Regex.*: this is a digit-processing problem, not a pattern-matching
    // one, and it keeps the example free of any regex engine parity concerns.
    // ASCII '0' = 48, '9' = 57 — anything outside that range is discarded.
    const $iRawLen = Str.len($sCardNumber);
    let $sCleanCard = "";
    for (let $i = 0; $i < $iRawLen; $i = $i + 1) {
        const $qCode = Str.char($sCardNumber, $i);
        if ($qCode >= 48 && $qCode <= 57) {
            $sCleanCard = $sCleanCard + Str.sub($sCardNumber, $i, 1);
        }
    }

    // Step 2: length guard. Most major card brands use 13-19 digits.
    const $iLen = Str.len($sCleanCard);
    if ($iLen < 13 || $iLen > 19) {
        return false;
    }

    // Step 3: walk right to left. The rightmost digit is the check digit and
    // is never doubled; every second digit after it is.
    let $qSum = 0;
    let $bAlternate = false;

    for (let $i = $iLen - 1; $i >= 0; $i = $i - 1) {
        let $qDigit = Cast.toInt(Str.sub($sCleanCard, $i, 1));

        if ($bAlternate === true) {
            $qDigit = $qDigit * 2;
            // If doubling produces a two-digit number, sum its digits
            // (equivalent to subtracting 9): e.g. 16 -> 1+6 = 7 = 16-9.
            if ($qDigit > 9) {
                $qDigit = $qDigit - 9;
            }
        }

        $qSum = $qSum + $qDigit;
        $bAlternate = !$bAlternate;
    }

    // Step 4: valid Luhn numbers make the total sum a multiple of 10.
    return ($qSum % 10) === 0;
};
