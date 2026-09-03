// @JSOL v0.2.97

/**
 @description
 Rosetta Code task: https://rosettacode.org/wiki/Run-length_encoding —
 the task requires both directions (encode and decode a string, and a
 round trip must reproduce the original). This is the REPL-facing entry
 point: it takes the text plus a mode string and dispatches to
 `$sRunLengthEncode` or `$sRunLengthDecode`, so a caller (or the REPL)
 only ever needs to call one function with two arguments.

 Encodes `$sText` (run-length encoding, e.g. `"aaabbc"` -> `"3a2b1c"`) or
 decodes it back, depending on `$sMode`.

@param {string} $sText - Text to encode, or encoded text to decode.
@param {string} $sMode - Either "encode" or "decode".
@returns {string} - The encoded or decoded result; "" for an unrecognized mode.
*/

/**
 @contract
 {
   "cases": [
     { "$sText": "aaabbbccd", "$sMode": "encode" },
     { "$sText": "3a3b2c1d", "$sMode": "decode" }
   ]
 }
*/

const $sRunLength = function($sText, $sMode) {
    if ($sMode === "encode") {
        return $sRunLengthEncode($sText);
    } else if ($sMode === "decode") {
        return $sRunLengthDecode($sText);
    }
    return "";
};

/**
 @description
 Compresses `$sText` using run-length encoding: each run of consecutive
 identical characters is replaced with the run length followed by the
 character, e.g. `"aaabbc"` -> `"3a2b1c"`. Effective for data with long
 runs of repeated values (simple bitmaps, sparse logs); ineffective, even
 counterproductive, on text with few or no repeats.

@param {string} $sText - Text to compress. May be empty.
@returns {string} - The run-length encoded text ("" if $sText is "").
*/

/**
 @contract
 {
   "cases": [
     { "$sText": "WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBBBBWWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWB" },
     { "$sText": "" }
   ]
 }
*/

const $sRunLengthEncode = function($sText) {
    const $qLen = Str.len($sText);
    let $sResult = "";

    if ($qLen === 0) {
        return $sResult;
    }

    let $sCurrentChar = Str.sub($sText, 0, 1);
    let $qRunTally = 1;

    for (let $i = 1; $i < $qLen; $i = $i + 1) {
        const $sChar = Str.sub($sText, $i, 1);

        if ($sChar === $sCurrentChar) {
            $qRunTally = $qRunTally + 1;
        } else {
            // The run ended: flush count-then-character, then start
            // tracking the new character.
            $sResult = $sResult + Cast.toStr($qRunTally) + $sCurrentChar;
            $sCurrentChar = $sChar;
            $qRunTally = 1;
        }
    }

    // The last run never gets flushed inside the loop, since nothing
    // follows it to trigger the "else" branch.
    $sResult = $sResult + Cast.toStr($qRunTally) + $sCurrentChar;

    return $sResult;
};

/**
 @description
 Reverses `$sRunLengthEncode`: reads a run-length-encoded string
 (`"3a2b1c"`) and reconstructs the original (`"aaabbc"`). Digits are
 accumulated into a buffer until a non-digit character is found, at
 which point that character is repeated the accumulated number of times.

@param {string} $sText - Run-length encoded text. May be empty.
@returns {string} - The decoded (original) text.
*/

/**
 @contract
 {
   "cases": [
     { "$sText": "12W1B12W3B24W1B14W3B27W1B7W" },
     { "$sText": "" }
   ]
 }
*/

const $sRunLengthDecode = function($sText) {
    const $qLen = Str.len($sText);
    let $sResult = "";
    let $sDigits = "";

    for (let $i = 0; $i < $qLen; $i = $i + 1) {
        const $qCode = Str.char($sText, $i);

        if ($qCode >= 48 && $qCode <= 57) {
            // '0'-'9': still part of the run-length count, keep buffering.
            $sDigits = $sDigits + Str.sub($sText, $i, 1);
        } else {
            const $qCount = Cast.toInt($sDigits);
            const $sChar = Str.sub($sText, $i, 1);
            let $qRepeat = 0;
            while ($qRepeat < $qCount) {
                $sResult = $sResult + $sChar;
                $qRepeat = $qRepeat + 1;
            }
            $sDigits = "";
        }
    }

    return $sResult;
};
