// @JSOL v0.2.91

/**
 * @description
 * Parses a single line of naive CSV into an array of field values, by
 * splitting on commas. Deliberately naive: it does not handle quoted
 * fields that contain a literal comma or an escaped quote (real CSV, per
 * RFC 4180, needs a small state machine for that). This covers the common
 * case of simple, unquoted data, e.g. "Buenos Aires,AR,2026".
 *
 * This file is a direct example of the payoff from adding Str.split to
 * the compiler: see reverse-word-order.jsol.js (06-string-algorithms) for
 * the ~15-line manual scan the same idea needed before Str.split existed,
 * and reverse-word-order-str-split.jsol.js for the one-call version.
 *
 * @param {string} $sCsvLine - One line of comma-separated values.
 * @returns {array<string>} - The fields, in order, exactly as they
 *   appeared between commas (not trimmed).
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$sCsvLine": "Buenos Aires,AR,2026" },
 *     { "$sCsvLine": "single-field" }
 *   ]
 * }
 */

const $aParseCsvLine = function($sCsvLine) {
    return Str.split($sCsvLine, ",");
};