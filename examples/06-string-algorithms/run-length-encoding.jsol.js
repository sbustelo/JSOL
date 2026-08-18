// @JSOL v0.2.91

/**
 @description
 Compresses $sText using run-length encoding: each run of consecutive
 identical characters is replaced with the character followed by its run
 length, e.g. "aaabbc" -> "a3b2c1". Effective for data with long runs of
 repeated values (simple bitmaps, sparse logs); ineffective, even
 counterproductive, on text with few or no repeats.

@param {string} $sText - Text to compress. Must be non-empty.
@returns {string} - The run-length encoded text.
*/

/**
 @contract
 {
   "cases": [
     { "$sText": "aaabbbccd" },
     { "$sText": "abcdef" }
   ]
 }
*/

const $sRunLengthEncode = function($sText) {
    const $iLen = Str.len($sText);
    let $sResult = "";

    let $sCurrentChar = Str.sub($sText, 0, 1);
    let $qRunLength = 1;

    for (let $i = 1; $i < $iLen; $i = $i + 1) {
        const $sChar = Str.sub($sText, $i, 1);

        if ($sChar === $sCurrentChar) {
            $qRunLength = $qRunLength + 1;
        } else {
            // The run ended: flush it, then start tracking the new character.
            $sResult = $sResult + $sCurrentChar + Cast.toStr($qRunLength);
            $sCurrentChar = $sChar;
            $qRunLength = 1;
        }
    }

    // The last run never gets flushed inside the loop, since nothing
    // follows it to trigger the "else" branch.
    $sResult = $sResult + $sCurrentChar + Cast.toStr($qRunLength);

    return $sResult;
};
