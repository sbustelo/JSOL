// @JSOL v0.2.97

/**
 @description
 
 # Rosetta Code: Anagrams
 
 This script solves the Anagrams task from Rosetta Code: 
 https://rosettacode.org/wiki/Anagrams
 
 ## Task
 
 Using a provided word list (e.g., unixdict.txt), find the sets of words that 
 share the same characters that contain the most words in them.
 
 ## JSOL Implementation Details
 
 JSOL's domain is pure business logic: it has no filesystem, DOM, or DB access. 
 Therefore, the word list is passed as a raw string argument to the entry 
 function `$aParseAndFindAnagrams`. This function normalizes any whitespace 
 (spaces, tabs, newlines) into single spaces, trims the string, and splits it 
 into an array of clean words. It then delegates the grouping logic to 
 `$aFindAnagramGroups`.
 
 Groups of size 1 (a word with no anagram partner) are never returned. JSOL's 
 Map has no way to increment an existing key's value, so grouping is done 
 with two parallel arrays: `$aSignatures` (each unique signature seen so far) 
 and `$aGroups` (the matching array of words for that signature).
 
 ### Entry Point API (`$aParseAndFindAnagrams`)
 - `$sDictionaryContent` (`string`): The raw content of unixdict.txt
 - **Returns** (`array<array<string>>`): The anagram group(s) with the most members. Empty if no word has an anagram partner.
 
 ## Output
 
 Pasting the content of `unixdict.txt` as an argument into [this JSOL code running in the REPL](http://jsol.bustelo.com.ar/?file=rosetta-code%2Fanagrams.jsol.js#repl) returns:
 ```js
 [
    ["abel","able","bale","bela","elba"],
    ["alger","glare","lager","large","regal"],
    ["angel","angle","galen","glean","lange"],
    ["caret","carte","cater","crate","trace"],
    ["elan","lane","lean","lena","neal"],
    ["evil","levi","live","veil","vile"]
 ]
```	
*/

/**
 @contract
 {
   "cases": [
     { "$sDictionaryContent": "listen silent enlist  banana cat act tac dog" }
   ]
 }
*/


/**
 * @param {string} $sDictionaryContent - The raw content of unixdict.txt
 * @returns {array<array<string>>} - The anagram group(s) with the most members. Empty if no word has an anagram partner.
 */


const $aParseAndFindAnagrams = function($sDictionaryContent) {
    // JSOL engine requires requiere regex como strings:
    const $xWhitespace = "\\s+";
    
    // JSOL's Regex.replace: (pattern, replacement, subject, flags)
    const $sNormalized = Regex.replace($xWhitespace, " ", $sDictionaryContent, "g");
    const $sTrimmed = Str.trim($sNormalized);
    
    const $aLines = Str.split($sTrimmed, " ");
    const $aCleanWords = [];
    const $qLineCount = Arr.len($aLines);

    for (let $i = 0; $i < $qLineCount; $i = $i + 1) {
        const $sWord = $aLines[$i];
        
        if (Str.len($sWord) > 0) {
            Arr.push($aCleanWords, $sWord);
        }
    }

    return $aFindAnagramGroups($aCleanWords);
};


/**
 * @param {array} $aWords - The dictionary / word list to search.
 * @returns {array<array>} - The anagram group(s) with the most members. Empty if no word in $aWords has an anagram partner.
 */

const $aFindAnagramGroups = function($aWords) {
    const $aSignatures = [];
    const $aGroups = [];

    const $qWordCount = Arr.len($aWords);
    for (let $i = 0; $i < $qWordCount; $i = $i + 1) {
        const $sWord = $aWords[$i];
        const $sSignature = $sSortLetters($sWord);

        const $qSigCount = Arr.len($aSignatures);
        let $qFoundAt = -1;
        for (let $qJ = 0; $qJ < $qSigCount; $qJ = $qJ + 1) {
            if ($aSignatures[$qJ] === $sSignature) {
                $qFoundAt = $qJ;
            }
        }

        if ($qFoundAt === -1) {
            Arr.push($aSignatures, $sSignature);
            Arr.push($aGroups, [$sWord]);
        } else {
            Arr.push($aGroups[$qFoundAt], $sWord);
        }
    }

    // Find the largest group size, then keep every group tied for it
    // (ties are common: "cat"/"act"/"tac" and "listen"/"silent"/"enlist"
    // are both size-3 groups).
    let $qMaxSize = 0;
    const $qGroupCount = Arr.len($aGroups);
    for (let $i = 0; $i < $qGroupCount; $i = $i + 1) {
        if (Arr.len($aGroups[$i]) > $qMaxSize) {
            $qMaxSize = Arr.len($aGroups[$i]);
        }
    }

    const $aLargestGroups = [];
    if ($qMaxSize > 1) {
        for (let $i = 0; $i < $qGroupCount; $i = $i + 1) {
            if (Arr.len($aGroups[$i]) === $qMaxSize) {
                Arr.push($aLargestGroups, $aGroups[$i]);
            }
        }
    }

    return $aLargestGroups;
};


/**
 * @param {string} $sWord - The word to be sorted.
 * @returns {string} - A string containing the same characters, sorted ascending by character code.
 */

const $sSortLetters = function($sWord) {
    const $sLower = Str.lower($sWord);
    const $qLen = Str.len($sLower);

    // Collect char codes, then insertion-sort them ascending: two words
    // are anagrams iff their sorted char codes are identical.
    const $aCodes = [];
    for (let $i = 0; $i < $qLen; $i = $i + 1) {
        Arr.push($aCodes, Str.char($sLower, $i));
    }

    for (let $i = 1; $i < $qLen; $i = $i + 1) {
        const $qKey = $aCodes[$i];
        let $qJ = $i - 1;
        while ($qJ >= 0 && $aCodes[$qJ] > $qKey) {
            $aCodes[$qJ + 1] = $aCodes[$qJ];
            $qJ = $qJ - 1;
        }
        $aCodes[$qJ + 1] = $qKey;
    }

    let $sSorted = "";
    for (let $i = 0; $i < $qLen; $i = $i + 1) {
        $sSorted = $sSorted + Str.fromChar($aCodes[$i]);
    }
    return $sSorted;
};