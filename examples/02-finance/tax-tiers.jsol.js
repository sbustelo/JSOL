// @JSOL v0.2.94

/**
 @contract
 {
   "cases": [
     {
       "in": { "$nGrossIncome": 40000.0, "$sTaxBracket": "tier_a" },
       "expect": { "_result": { "gross": 40000.0, "rate": 0.10, "tax": 4000.0, "net": 36000.0 } }
     },
     {
       "in": { "$nGrossIncome": 60000.0, "$sTaxBracket": "tier_a" },
       "expect": { "_result": { "gross": 60000.0, "rate": 0.20, "tax": 12000.0, "net": 48000.0 } }
     },
     {
       "in": { "$nGrossIncome": 90000.0, "$sTaxBracket": "tier_b" },
       "expect": { "_result": { "gross": 90000.0, "rate": 0.25, "tax": 22500.0, "net": 67500.0 } }
     },
     {
       "in": { "$nGrossIncome": 120000.0, "$sTaxBracket": "tier_b" },
       "expect": { "_result": { "gross": 120000.0, "rate": 0.35, "tax": 42000.0, "net": 78000.0 } }
     },
     {
       "in": { "$nGrossIncome": 10000.0, "$sTaxBracket": "default" },
       "expect": { "_result": { "gross": 10000.0, "rate": 0.05, "tax": 500.0, "net": 9500.0 } }
     }
   ]
 }
*/

const $mCalculateTaxAmount = function($nGrossIncome, $sTaxBracket) {
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