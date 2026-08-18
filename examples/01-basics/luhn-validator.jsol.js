// @JSOL v0.2.91

/**
 @description
 Validates a card number using the Luhn algorithm (mod 10 checksum), used
 to catch single-digit typos and transpositions in credit card numbers and
 other identification numbers.

@param {string} $sCardNumber - Card number, may contain spaces or dashes.
@returns {boolean} - True if $sCardNumber passes the Luhn check, false otherwise.
  Standard test cards (source: Mercado Pago and Adyen public test-card docs):
   VISA:       4509 9535 6623 3704
   Mastercard: 5555 5555 5555 4444
*/

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
