// @JSOL v0.2.91

const $calculateTaxAmount = function($nGrossIncome, $sTaxBracket) {
    let $nRate = 0.0;

    if ($sTaxBracket === "tier_a") {
        if ($nGrossIncome > 50000.0) {
            $nRate = 0.20;
        } else {
            $nRate = 0.10;
        }
    } else if ($sTaxBracket === "tier_b") {
        if ($nGrossIncome > 100000.0) {
            $nRate = 0.35;
        } else {
            $nRate = 0.25;
        }
    } else {
        $nRate = 0.05;
    }

    const $nTaxDue = $nGrossIncome * $nRate;
    const $nNetIncome = $nGrossIncome - $nTaxDue;

    return Map.create(
        "gross", $nGrossIncome,
        "rate", $nRate,
        "tax", $nTaxDue,
        "net", $nNetIncome
    );
};