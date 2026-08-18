// @JSOL v0.2.91

/**
 @description
 Converts an sRGB color (0-255 per channel) to HSB/HSV: Hue (0-360
 degrees), Saturation (0-1), and Brightness/Value (0-1). Brightness is
 simply the largest of the three normalized channels. Saturation
 measures how far the color is from gray, relative to its brightness.
 Hue comes from which channel is largest and how the other two compare
 to it, split into six 60-degree sectors going around the color wheel
 (red to yellow, yellow to green, and so on).
  The standard formula for the hue sector where red is the largest
 channel normally closes with "mod 6"; here that is replaced with "if
 negative, add 360" after the fact instead, since PHP's % operator
 truncates its operands to integers first, while JS's performs true
 floating-point modulo — an exact case of the kind of silent JS/PHP
 divergence this project exists to avoid. Both approaches give the same
 result for every input in this domain, without ever relying on % with
 a non-integer operand.
  See hsb-to-rgb.jsol.js for the inverse.

@param {integer} $qR - Red channel, 0-255.
@param {integer} $qG - Green channel, 0-255.
@param {integer} $qB - Blue channel, 0-255.
@returns {Map} - "h" (0-360), "s" (0-1), "b" (0-1).
*/

/**
 @contract
 {
   "cases": [
     { "$qR": 255, "$qG": 0, "$qB": 0 },
     { "$qR": 0, "$qG": 128, "$qB": 128 },
     { "$qR": 50, "$qG": 50, "$qB": 50 }
   ]
 }
*/

const $mRgbToHsb = function($qR, $qG, $qB) {
    const $nR = $qR / 255;
    const $nG = $qG / 255;
    const $nB = $qB / 255;

    const $nMax = Math.max($nR, Math.max($nG, $nB));
    const $nMin = Math.min($nR, Math.min($nG, $nB));
    const $nDelta = $nMax - $nMin;
    const $nBrightness = $nMax;

    let $nSaturation = 0;
    if ($nMax > 0) {
        $nSaturation = $nDelta / $nMax;
    }

    let $nHue = 0;
    if ($nDelta > 0) {
        if ($nMax === $nR) {
            $nHue = 60 * (($nG - $nB) / $nDelta);
        } else if ($nMax === $nG) {
            $nHue = 60 * ((($nB - $nR) / $nDelta) + 2);
        } else {
            $nHue = 60 * ((($nR - $nG) / $nDelta) + 4);
        }
    }
    if ($nHue < 0) {
        $nHue = $nHue + 360;
    }

    return Map.create("h", $nHue, "s", $nSaturation, "b", $nBrightness);
};
