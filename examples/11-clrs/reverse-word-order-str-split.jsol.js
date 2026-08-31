// @JSOL v0.2.91

/**
 @description
 Reverses the order of words in $sSentence, keeping each word intact,
 e.g. "the quick brown fox" -> "fox brown quick the". Uses Str.split to
 break the sentence into words directly.
  See reverse-word-order.jsol.js for the same result built from Str.len
 and Str.sub alone, without Str.split. That version stays in the suite
 on purpose: it is the reference for how far JSOL's core vocabulary goes
 even without a dedicated split, and this file is the same problem once
 that primitive exists.

@param {string} $sSentence - Words separated by single spaces.
@returns {string} - The words in reverse order, still separated by single spaces.
*/

/**
 @contract
 {
   "cases": [
     { "$sSentence": "the quick brown fox" },
     { "$sSentence": "hello" }
   ]
 }
*/

const $sReverseWordOrderSplit = function($sSentence) {
    const $aWords = Str.split($sSentence, " ");
    const $qCount = Arr.len($aWords);

    let $sResult = "";
    for (let $i = $qCount - 1; $i >= 0; $i = $i - 1) {
        $sResult = $sResult + $aWords[$i];
        if ($i > 0) {
            $sResult = $sResult + " ";
        }
    }

    return $sResult;
};
