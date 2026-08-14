// @JSOL v0.2.91

/**
 * @description
 * Converts $sTitle into a URL-friendly slug: lowercases it, replaces every
 * run of one or more non-alphanumeric characters with a single hyphen,
 * and trims any leading or trailing hyphen left over. Unlike
 * phone-number-normalizer.jsol.js (filtering to a fixed character set,
 * doable with a plain scan), collapsing variable-length runs of unwanted
 * characters into a single separator is a problem regex is actually
 * suited for, which is why this example uses Regex.*.
 *
 * @param {string} $sTitle - Any text, e.g. a blog post title.
 * @returns {string} - Lowercase, hyphen-separated slug.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$sTitle": "  Hello, World!! Ready?  " },
 *     { "$sTitle": "JSOL: JavaScript Source Of Logic" }
 *   ]
 * }
 */

// @UNVERIFIED-PARITY: Regex.replace compiles to each target's native regex
// engine ("fast" mode), not the pure-JSOL Thompson NFA engine. This
// example exists specifically to demonstrate Regex.* on a problem where
// it earns its place (collapsing variable-length runs), unlike
// phone-number-normalizer.jsol.js in this same folder.
const $sSlugify = function($sTitle) {
    const $sLower = Str.lower($sTitle);

    // Collapse every run of one or more non-alphanumeric characters into a
    // single hyphen.
    const $sHyphenated = Regex.replace("[^a-z0-9]+", "-", $sLower, "g");

    // Trim a leading or trailing hyphen, if the collapse left one (e.g.
    // the title started or ended with punctuation or spaces).
    const $qLen = Str.len($sHyphenated);
    let $qStart = 0;
    let $qEnd = $qLen;

    if ($qLen > 0 && Str.sub($sHyphenated, 0, 1) === "-") {
        $qStart = 1;
    }
    if ($qLen > 0 && Str.sub($sHyphenated, $qLen - 1, 1) === "-") {
        $qEnd = $qLen - 1;
    }

    if ($qStart >= $qEnd) {
        return "";
    }

    return Str.sub($sHyphenated, $qStart, $qEnd - $qStart);
};