// @JSOL v0.2.91

/**
 @description
 Applies a sequence of percentage discounts to $nPrice one after another,
 each computed on the price left over from the previous discount, not on
 the original price. This is how "stacked" promotions actually behave in
 most retail systems: three 10% discounts do not add up to 30% off, they
 compound down to roughly 27.1% off (0.9^3 = 0.729).

@param {number} $nPrice - Original price before any discount.
@param {array<number>} $aDiscountRates - Discount rates as decimals, applied in order (0.1 = 10%).
@returns {number} - Final price after every discount has been applied in sequence.
*/

/**
 @contract
 {
   "cases": [
     { "$nPrice": 100, "$aDiscountRates": [0.1, 0.1, 0.1] },
     { "$nPrice": 200, "$aDiscountRates": [] }
   ]
 }
*/

const $nApplyStackedDiscounts = function($nPrice, $aDiscountRates) {
    let $nCurrentPrice = $nPrice;
    const $qCount = Arr.len($aDiscountRates);

    for (let $i = 0; $i < $qCount; $i = $i + 1) {
        const $nRate = $aDiscountRates[$i];
        $nCurrentPrice = $nCurrentPrice - ($nCurrentPrice * $nRate);
    }

    return $nCurrentPrice;
};