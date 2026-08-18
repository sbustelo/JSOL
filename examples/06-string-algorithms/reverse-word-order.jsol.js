// @JSOL v0.2.91

/**
 @description
 Reverses the order of words in $sSentence, keeping each word itself
 intact, e.g. "the quick brown fox" -> "fox brown quick the". Splits on
 single spaces manually (Str.split is not part of the confirmed v0.2.91
 vocabulary, so a plain character scan is used instead, the same
 technique behind any split implementation), collecting words into an
 array, then rebuilds the sentence walking that array back to front.

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

const $sReverseWordOrder = function($sSentence) {
    // Step 1: scan the sentence, collecting each word into $aWords whenever
    // a space is hit, and flushing whatever word is left over at the end.
    const $iLen = Str.len($sSentence);
    const $aWords = [];
    let $sCurrentWord = "";

    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        const $sChar = Str.sub($sSentence, $i, 1);
        if ($sChar === " ") {
            Arr.push($aWords, $sCurrentWord);
            $sCurrentWord = "";
        } else {
            $sCurrentWord = $sCurrentWord + $sChar;
        }
    }
    Arr.push($aWords, $sCurrentWord);

    // Step 2: rebuild the sentence walking $aWords from the last entry to
    // the first.
    const $qCount = Arr.count($aWords);
    let $sResult = "";
    for (let $i = $qCount - 1; $i >= 0; $i = $i - 1) {
        $sResult = $sResult + $aWords[$i];
        if ($i > 0) {
            $sResult = $sResult + " ";
        }
    }

    return $sResult;
};
