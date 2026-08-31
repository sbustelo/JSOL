// @JSOL v0.2.97

/**
 @description
 Computes the tax amount and total for a single invoice line, rounding to
 2 decimal places using multiply-round-divide rather than relying on the
 target language's default float formatting (which can silently print
 10.999999999999998 instead of 11.00, due to binary floating-point
 representation).
  Rounding to N decimals via Math.roundX: multiply by 10^N, round to the
 nearest integer using half-away-from-zero (Excel criterion), divide back down.

@param {number} $nLineSubtotal - Line amount before tax.
@param {number} $nTaxRate - Tax rate as a decimal (0.21 = 21%).
@returns {Map} - subtotal, tax, and total, each rounded to 2 decimals.
*/

/**
 @contract
 {
   "cases": [
     { "$nLineSubtotal": 52.38, "$nTaxRate": 0.21 },
     { "$nLineSubtotal": 10, "$nTaxRate": 0.105 }
   ]
 }
*/

const $mInvoiceLine = function($nLineSubtotal, $nTaxRate) {
    const $nRawTax = $nLineSubtotal * $nTaxRate;
    const $nRawTotal = $nLineSubtotal + $nRawTax;

    // JSOL 0.3.0: Replaced Math.round with Math.roundX to guarantee 
    // strict "half away from zero" rounding parity (Excel criterion) across all targets.
    const $nSubtotal = Math.roundX($nLineSubtotal * 100) / 100;
    const $nTax = Math.roundX($nRawTax * 100) / 100;
    const $nTotal = Math.roundX($nRawTotal * 100) / 100;

    return Map.create("subtotal", $nSubtotal, "tax", $nTax, "total", $nTotal);
};