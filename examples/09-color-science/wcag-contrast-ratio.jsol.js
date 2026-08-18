// @JSOL v0.2.91

/**
 @description
 Computes the WCAG 2.x contrast ratio between two sRGB colors, each given
 as 0-255 red/green/blue components. First, each color's relative
 luminance is computed: normalize each channel to 0-1, apply the sRGB
 "linearization" curve (a near-linear segment for very dark values, a
 gamma curve above that), then combine the three linearized channels
 with the standard luminance weights (green contributes most to
 perceived brightness, blue the least). Then the contrast ratio is
 (lighter + 0.05) / (darker + 0.05); it ranges from 1 (identical colors)
 to 21 (pure black against pure white).
  Formula source: WCAG 2.1, published by the W3C as an open standard.
 This is the published math itself, not any vendor's implementation of it.

@param {integer} $qR1 - Red channel of the first color, 0-255.
@param {integer} $qG1 - Green channel of the first color, 0-255.
@param {integer} $qB1 - Blue channel of the first color, 0-255.
@param {integer} $qR2 - Red channel of the second color, 0-255.
@param {integer} $qG2 - Green channel of the second color, 0-255.
@param {integer} $qB2 - Blue channel of the second color, 0-255.
@returns {number} - Contrast ratio, from 1 to 21.
*/

/**
 @contract
 {
   "cases": [
     { "$qR1": 0, "$qG1": 0, "$qB1": 0, "$qR2": 255, "$qG2": 255, "$qB2": 255 },
     { "$qR1": 119, "$qG1": 119, "$qB1": 119, "$qR2": 255, "$qG2": 255, "$qB2": 255 }
   ]
 }
*/

const $nLinearizeChannel = function($qChannel8Bit) {
    const $nNormalized = $qChannel8Bit / 255;

    if ($nNormalized <= 0.03928) {
        return $nNormalized / 12.92;
    }

    return Math.pow(($nNormalized + 0.055) / 1.055, 2.4);
};

const $nRelativeLuminance = function($qR, $qG, $qB) {
    const $nR = $nLinearizeChannel($qR);
    const $nG = $nLinearizeChannel($qG);
    const $nB = $nLinearizeChannel($qB);

    return (0.2126 * $nR) + (0.7152 * $nG) + (0.0722 * $nB);
};

const $nWcagContrastRatio = function($qR1, $qG1, $qB1, $qR2, $qG2, $qB2) {
    const $nLuminance1 = $nRelativeLuminance($qR1, $qG1, $qB1);
    const $nLuminance2 = $nRelativeLuminance($qR2, $qG2, $qB2);

    let $nLighter = $nLuminance1;
    let $nDarker = $nLuminance2;
    if ($nLuminance2 > $nLuminance1) {
        $nLighter = $nLuminance2;
        $nDarker = $nLuminance1;
    }

    return ($nLighter + 0.05) / ($nDarker + 0.05);
};
