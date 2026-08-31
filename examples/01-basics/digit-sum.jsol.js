// @JSOL v0.2.91

/**
@description

 Sums the individual digits of a digit sequence $sDigits
 (e.g. "493" -> 4 + 9 + 3 = 16).

 The parameter is deliberately typed $sDigits, not $qDigits or $nDigits.
 
 A $q/$n prefix tells the REPL to bind the incoming @contract value as a
 JS Number before this function ever runs. Past 16 digits that exceeds
 Number.MAX_SAFE_INTEGER (9007199254740991); V8 silently switches to
 scientific notation ("2.3414343143143434e+21"), and by the time the
 function body walks that string with Str.sub / Cast.toInt, it is reading
 the letter 'e' and the '+' sign as if they were digits, producing NaN.
 Casting to string *inside* the function is already too late, the
 precision is gone before the body executes.

Typing the parameter $sDigits instead means the REPL binds it as a plain
 string from the start and never routes it through a Number at all, so
 there is no length at which this breaks.

@param {string} $sDigits - A sequence of ASCII digit characters.
@returns {integer} - The sum of the digits in $sDigits.
*/

/**
 @contract
 {
   "cases": [
     { "$sDigits": "493" },
     { "$sDigits": "0" },
     { "$sDigits": "2341434314314343433121" }
   ]
 }
*/

const $qDigitSum = function($sDigits) {
    const $iLen = Str.len($sDigits);
    let $qSum = 0;

    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        $qSum = $qSum + Cast.toInt(Str.sub($sDigits, $i, 1));
    }

    return $qSum;
};
