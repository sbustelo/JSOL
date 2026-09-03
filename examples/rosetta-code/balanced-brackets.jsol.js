// @JSOL v0.2.97

/**
 @description
 Rosetta Code task: https://rosettacode.org/wiki/Balanced_brackets — the
 task asks for a program that generates several strings of balanced
 brackets and several deliberately unbalanced ones, then validates all of
 them. JSOL's Deterministic Parity pillar rules out generating "random"
 test strings (every target's transpilation must produce bit-for-bit
 identical output), so instead of generating cases, this file widens the
 contract to a fixed, hand-picked set covering the same categories a
 random generator would produce: empty, deeply nested, wrong order,
 unmatched open, unmatched close, and mixed bracket types.

 Checks whether every bracket in `$sText` is properly opened and closed
 in the correct order, for three bracket types: `()`, `[]`, and `{}`. The
 classic stack-based solution: walk the string, push every opening
 bracket onto a stack, and on every closing bracket, pop the stack and
 check it matches. If the stack is not empty at the end, or a closing
 bracket does not match what is on top of the stack, the text is
 unbalanced.

 JSOL has no dedicated stack type; `Arr.push` / `Arr.pop` on a plain
 array is exactly a stack, last-in-first-out by construction, no wrapper
 needed.

@param {string} $sText - Text containing zero or more of (), [], {}.
@returns {boolean} - True if every bracket is balanced and correctly nested.
*/

/**
 @contract
 {
   "cases": [
     { "$sText": "" },
     { "$sText": "()" },
     { "$sText": "([{}])" },
     { "$sText": "((([[[{{{}}}]]])))" },
     { "$sText": "([)]" },
     { "$sText": "(" },
     { "$sText": ")" },
     { "$sText": "]][[" },
     { "$sText": "{[()]}{[()]}" },
     { "$sText": "text (with) [some] {brackets} inside" }
   ]
 }
*/

const $bIsBalanced = function($sText) {
    const $aStack = [];
    const $iLen = Str.len($sText);

    for (let $i = 0; $i < $iLen; $i = $i + 1) {
        const $sChar = Str.sub($sText, $i, 1);

        if ($sChar === "(" || $sChar === "[" || $sChar === "{") {
            Arr.push($aStack, $sChar);
        } else if ($sChar === ")" || $sChar === "]" || $sChar === "}") {
            if (Arr.len($aStack) === 0) {
                // A closing bracket with nothing open to match: unbalanced.
                return false;
            }

            const $sExpectedOpening = Arr.pop($aStack);

            if ($sChar === ")" && $sExpectedOpening !== "(") {
                return false;
            }
            if ($sChar === "]" && $sExpectedOpening !== "[") {
                return false;
            }
            if ($sChar === "}" && $sExpectedOpening !== "{") {
                return false;
            }
        }
        // Any other character is ignored: only bracket balance matters here.
    }

    // If anything is left on the stack, some opening bracket was never closed.
    return Arr.len($aStack) === 0;
};
