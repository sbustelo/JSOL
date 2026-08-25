// @JSOL v0.2.96

/**
 @description

 # Simplified JSOL Adoption Economics
 
 Simplified version of `adoption-economics.jsol.js`: same break-even model
 from **ADOPTION_ECONOMICS.md**, collapsed from 11 inputs to 5 by folding
 dev cost and QA cost into a single number per side (native and JSOL),
 and treating host-adaptation cost (H/h, "wiring, not logic" per the
 source doc) as negligible rather than asking for it separately.
 
 ## Cost Formulas
 
 `setupCostNative     = qTargets * nNativeCostSetup`
 `setupCostJsol       = nJsolCostSetup`
 `iterationCostNative = qTargets * nNativeCostIteration`
 `iterationCostJsol   = nJsolCostIteration`
 
 ## Derivation Reference
 
 See `adoption-economics.jsol.js` for the full derivation of **verdict** and
 **breakEvenIterations** from setupGap and perIterationSavings, including
 why a single "immediate win" boolean is the wrong shape for this
 result: setup cost and per-iteration cost can favor different sides,
 and collapsing that into one flag hides real scenarios (JSOL can be
 cheaper today and still lose over time if its iteration cost is high
 enough — **jsol_wins_until_expiration** below).
 
 ## Parameters
 
 - **@param {integer} $qTargets** - N, number of target languages (e.g. 2 for JS+PHP).
 - **@param {number} $nNativeCostSetup** - Combined dev+QA cost per target, writing it the first time.
 - **@param {number} $nJsolCostSetup** - Cost of writing and verifying the .jsol file, first time.
 - **@param {number} $nNativeCostIteration** - Combined dev+QA cost per target, per later change.
 - **@param {number} $nJsolCostIteration** - Cost of changing and re-verifying the .jsol file, per later change.
 
 ## Returns
 
 - **@returns {Map}** - **verdict**: *jsol_wins_always* | *jsol_wins_after_breakeven* | *jsol_wins_until_expiration* | *native_always_wins*
 - **breakEvenIterations**: -1 when no finite crossover exists
 - **setupCostNative**: Total native setup cost
 - **setupCostJsol**: Total JSOL setup cost
 - **iterationCostNative**: Total native iteration cost
 - **iterationCostJsol**: Total JSOL iteration cost
 */


/**
 @contract
 {
   "cases": [
     { "$qTargets": 2, "$nNativeCostSetup": 2, "$nJsolCostSetup": 4, "$nNativeCostIteration": 0.8, "$nJsolCostIteration": 0.7 },
     { "$qTargets": 2, "$nNativeCostSetup": 2, "$nJsolCostSetup": 6, "$nNativeCostIteration": 0.8, "$nJsolCostIteration": 1 },
     { "$qTargets": 4, "$nNativeCostSetup": 2, "$nJsolCostSetup": 7, "$nNativeCostIteration": 0.8, "$nJsolCostIteration": 2 }
   ]
 }
*/

const $mAdoptionEconomicsSimple = function($qTargets, $nNativeCostSetup, $nJsolCostSetup, $nNativeCostIteration, $nJsolCostIteration) {
    const $nSetupCostNative = $qTargets * $nNativeCostSetup;
    const $nSetupCostJsol = $nJsolCostSetup;

    const $nIterationCostNative = $qTargets * $nNativeCostIteration;
    const $nIterationCostJsol = $nJsolCostIteration;

    const $nSetupGap = $nSetupCostJsol - $nSetupCostNative;
    const $nPerIterationSavings = $nIterationCostNative - $nIterationCostJsol;

    let $sVerdict = "native_always_wins";
    let $nBreakEvenIterations = -1;

    if ($nPerIterationSavings > 0) {
        if ($nSetupGap <= 0) {
            $sVerdict = "jsol_wins_always";
            $nBreakEvenIterations = 0;
        } else {
            $sVerdict = "jsol_wins_after_breakeven";
            $nBreakEvenIterations = $nSetupGap / $nPerIterationSavings;
        }
    } else if ($nPerIterationSavings < 0) {
        if ($nSetupGap < 0) {
            $sVerdict = "jsol_wins_until_expiration";
            $nBreakEvenIterations = $nSetupGap / $nPerIterationSavings;
        }
    } else {
        if ($nSetupGap <= 0) {
            $sVerdict = "jsol_wins_always";
            $nBreakEvenIterations = 0;
        }
    }

    return Map.create(
        "verdict", $sVerdict,
        "breakEvenIterations", $nBreakEvenIterations,
        "setupCostNative", $nSetupCostNative,
        "setupCostJsol", $nSetupCostJsol,
        "iterationCostNative", $nIterationCostNative,
        "iterationCostJsol", $nIterationCostJsol
    );
};
