// @JSOL v0.2.91

/**
 @description
 Checks whether $sTextA and $sTextB are anagrams of each other: same
 letters, same counts, any order. Compares lowercase letters a-z only
 (spaces and punctuation are ignored); building a 26-slot frequency table
 for each string and comparing them is equivalent to comparing sorted
 versions of both strings, without needing a sort at all.
  Uses a fixed-size array as the frequency table rather than a Map: Map in
 JSOL has no way to increment an existing key's value, only Map.create,
 Map.has, and Map.keys, so a mutable counter needs Arr instead, indexed by
 (char code - 'a' code).

@param {string} $sTextA - First string.
@param {string} $sTextB - Second string.
@returns {boolean} - True if both strings are anagrams of each other.
*/

/**
 @contract
 {
   "cases": [
     { "$sTextA": "listen", "$sTextB": "silent" },
     { "$sTextA": "hello", "$sTextB": "world" }
   ]
 }
*/

const $bIsAnagram = function($sTextA, $sTextB) {
    const $sLowerA = Str.lower($sTextA);
    const $sLowerB = Str.lower($sTextB);

    // $aCounts: 26 slots, one per letter a-z, all starting at 0.
    const $aCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Add 1 to the slot for each letter in $sLowerA, subtract 1 for each
    // letter in $sLowerB. If the two strings are anagrams, every slot
    // returns to exactly 0; non-letter characters are skipped entirely.
    const $iLenA = Str.len($sLowerA);
    for (let $i = 0; $i < $iLenA; $i = $i + 1) {
        const $qCode = Str.char($sLowerA, $i);
        if ($qCode >= 97 && $qCode <= 122) {
            const $qSlot = $qCode - 97;
            $aCounts[$qSlot] = $aCounts[$qSlot] + 1;
        }
    }

    const $iLenB = Str.len($sLowerB);
    for (let $i = 0; $i < $iLenB; $i = $i + 1) {
        const $qCode = Str.char($sLowerB, $i);
        if ($qCode >= 97 && $qCode <= 122) {
            const $qSlot = $qCode - 97;
            $aCounts[$qSlot] = $aCounts[$qSlot] - 1;
        }
    }

    for (let $qSlot = 0; $qSlot < 26; $qSlot = $qSlot + 1) {
        if ($aCounts[$qSlot] !== 0) {
            return false;
        }
    }

    return true;
};
