// @JSOL v0.2.91

/**
 * @description
 * Converts an HSB/HSV color (Hue 0-360, Saturation 0-1, Brightness 0-1)
 * back to sRGB (0-255 per channel), the inverse of rgb-to-hsb.jsol.js.
 * Splits the hue into one of six 60-degree sectors, computes three
 * reference values for that sector ($nChroma, the color's intensity;
 * $nX, a secondary value for the "in-between" channel; $nMatch, the
 * offset that aligns brightness), and assigns (R,G,B) from those three
 * values in the pattern specific to that sector, mirroring exactly how
 * rgb-to-hsb.jsol.js derived the sector in the first place.
 *
 * @param {number} $nHue - Hue in degrees, 0-360.
 * @param {number} $nSaturation - Saturation, 0-1.
 * @param {number} $nBrightness - Brightness/Value, 0-1.
 * @returns {Map} - "r", "g", "b", each 0-255, rounded to the nearest integer.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$nHue": 0, "$nSaturation": 1, "$nBrightness": 1 },
 *     { "$nHue": 180, "$nSaturation": 1, "$nBrightness": 0.5019607843137255 },
 *     { "$nHue": 0, "$nSaturation": 0, "$nBrightness": 0.19607843137254902 }
 *   ]
 * }
 */

const $mHsbToRgb = function($nHue, $nSaturation, $nBrightness) {
    const $nChroma = $nBrightness * $nSaturation;
    const $nHuePrime = $nHue / 60;

    // $nHuePrime mod 2, computed without % (see rgb-to-hsb.jsol.js for why):
    // subtract 2 repeatedly while >= 2, which for a value already known to
    // be in [0, 6) takes at most two subtractions.
    let $nHuePrimeMod2 = $nHuePrime;
    while ($nHuePrimeMod2 >= 2) {
        $nHuePrimeMod2 = $nHuePrimeMod2 - 2;
    }

    const $nX = $nChroma * (1 - Math.abs($nHuePrimeMod2 - 1));
    const $nMatch = $nBrightness - $nChroma;

    let $nR1 = 0;
    let $nG1 = 0;
    let $nB1 = 0;

    if ($nHuePrime < 1) {
        $nR1 = $nChroma;
        $nG1 = $nX;
        $nB1 = 0;
    } else if ($nHuePrime < 2) {
        $nR1 = $nX;
        $nG1 = $nChroma;
        $nB1 = 0;
    } else if ($nHuePrime < 3) {
        $nR1 = 0;
        $nG1 = $nChroma;
        $nB1 = $nX;
    } else if ($nHuePrime < 4) {
        $nR1 = 0;
        $nG1 = $nX;
        $nB1 = $nChroma;
    } else if ($nHuePrime < 5) {
        $nR1 = $nX;
        $nG1 = 0;
        $nB1 = $nChroma;
    } else {
        $nR1 = $nChroma;
        $nG1 = 0;
        $nB1 = $nX;
    }

    const $qR = Math.round(($nR1 + $nMatch) * 255);
    const $qG = Math.round(($nG1 + $nMatch) * 255);
    const $qB = Math.round(($nB1 + $nMatch) * 255);

    return Map.create("r", $qR, "g", $qG, "b", $qB);
};
