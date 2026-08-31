// @JSOL v0.2.97

/**
 @description
 Trims canonical JSOL WhiteSpace from the start and end of a string.
 This demonstrates a CORE-2 function written entirely in JSOL, eliminating 
 the need for native engine polyfills and evading the semantic divergences 
 in what different languages consider "whitespace".
*/

/**
 @contract
 {
   "cases": [
     { "in": { "$sText": "  hello  " }, "expect": "hello" },
     { "in": { "$sText": "world" }, "expect": "world" },
     { "in": { "$sText": "\u00A0hello\u00A0" }, "expect": "hello" },
     { "in": { "$sText": "   " }, "expect": "" }
   ]
 }
*/

const $sTrimWhitespace = function($sText) {
    // Uses the canonical JSOL Unicode WhiteSpace regular expression.
    return Regex.replace("^[\\u0009-\\u000D\\u0020\\u0085\\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000\\uFEFF]+|[\\u0009-\\u000D\\u0020\\u0085\\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000\\uFEFF]+$", "", $sText, "g");
};