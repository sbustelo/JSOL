// @JSOL v0.2.91

/**
 * @description
 * Computes the tax amount and total for a single invoice line, rounding to
 * 2 decimal places using multiply-round-divide rather than relying on the
 * target language's default float formatting (which can silently print
 * 10.999999999999998 instead of 11.00, due to binary floating-point
 * representation).
 *
 * Rounding to N decimals via Math.round: multiply by 10^N, round to the
 * nearest integer, divide back down. Spelled out manually because JSOL has
 * no toFixed()-style helper, and float rounding is exactly the kind of
 * detail that must never be assumed identical between a JS engine and a
 * PHP engine without checking.
 *
 * @param {number} $nLineSubtotal - Line amount before tax.
 * @param {number} $nTaxRate - Tax rate as a decimal (0.21 = 21%).
 * @returns {Map} - subtotal, tax, and total, each rounded to 2 decimals.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$nLineSubtotal": 52.38, "$nTaxRate": 0.21 },
 *     { "$nLineSubtotal": 10, "$nTaxRate": 0.105 }
 *   ]
 * }
 */

const $mInvoiceLine = function($nLineSubtotal, $nTaxRate) {
    const $nRawTax = $nLineSubtotal * $nTaxRate;
    const $nRawTotal = $nLineSubtotal + $nRawTax;

    const $nSubtotal = Math.round($nLineSubtotal * 100) / 100;
    const $nTax = Math.round($nRawTax * 100) / 100;
    const $nTotal = Math.round($nRawTotal * 100) / 100;

    return Map.create("subtotal", $nSubtotal, "tax", $nTax, "total", $nTotal);
};