// @JSOL v0.2.91

/**
 @description
 
 Computes whether adopting JSOL for a given algorithm pays for itself,
 using the break-even model from ADOPTION_ECONOMICS.md. Two paths are
 compared: writing the algorithm by hand in every target language
 ("native"), versus writing it once in JSOL and adapting the compiled
 output into each target ("jsol"). Each path has a setup cost (writing
 it the first time) and a per-iteration cost (every later change).
 
 setupCostNative     = qTargets * (nDevCostSetup + nQaCostSetup)
 setupCostJsol       = nJsolWriteCostSetup + (qTargets * nHostAdaptationCostSetup) + nJsolQaCostSetup
 iterationCostNative = qTargets * (nDevCostIteration + nQaCostIteration)
 iterationCostJsol   = nJsolWriteCostIteration + nJsolQaCostIteration + (qTargets * nHostAdaptationCostIteration)
 
 The naive version of this function returned a single "immediate win"
 flag gated only on whether setup was cheaper. That is wrong: setup cost
 and per-iteration cost can point in opposite directions, and collapsing
 them into one flag hides real scenarios. There are four distinct cases,
 from crossing setupGap = setupCostJsol - setupCostNative and
 perIterationSavings = iterationCostNative - iterationCostJsol:
    - perIterationSavings > 0, setupGap <= 0: JSOL cheaper now AND every
     iteration going forward. "jsol_wins_always", breakEven = 0.
   - perIterationSavings > 0, setupGap > 0: JSOL starts more expensive
     but each iteration closes the gap. "jsol_wins_after_breakeven",
     breakEven = setupGap / perIterationSavings (a future point).
   - perIterationSavings < 0, setupGap < 0: JSOL starts cheaper but each
     iteration is MORE expensive than native, eroding the lead.
     "jsol_wins_until_expiration", breakEven = setupGap /
     perIterationSavings (a positive number: the point where native
     catches back up and overtakes JSOL). A small value here means JSOL
     is only cheaper for a sliver of a single iteration in practice.
   - Anything else (JSOL starts more expensive AND stays more expensive
     per iteration, or the two are permanently parallel with no
     crossover): "native_always_wins", breakEven = -1 (no finite point
     exists).
 
 This function makes no judgment about whether an algorithm will
 actually see that many iterations, that estimate is the reader's to
 make.

@param {integer} $qTargets - N, number of target languages (e.g. 2 for JS+PHP).
@param {number} $nDevCostSetup - D, native dev cost per target, first time.
@param {number} $nQaCostSetup - Q, native QA cost per target, first time.
@param {number} $nJsolWriteCostSetup - S, cost of writing the .jsol file itself, first time.
@param {number} $nHostAdaptationCostSetup - H, cost of wiring compiled output into one target, first time.
@param {number} $nJsolQaCostSetup - Q_jsol, cost of verifying the JSOL algorithm once, first time.
@param {number} $nDevCostIteration - d, native dev cost per target, per later change.
@param {number} $nQaCostIteration - q, native QA cost per target, per later change.
@param {number} $nJsolWriteCostIteration - s, cost of changing the .jsol file, per later change.
@param {number} $nHostAdaptationCostIteration - h, cost of re-wiring one target, per later change.
@param {number} $nJsolQaCostIteration - q_jsol, cost of re-verifying the JSOL algorithm, per later change.
@returns {Map} - "verdict" (one of the four cases above), "breakEvenIterations"
   (-1 when no finite crossover exists), "setupCostNative", "setupCostJsol",
   "iterationCostNative", "iterationCostJsol".
*/

/**
 @contract
 {
   "cases": [
     { "$qTargets": 2, "$nDevCostSetup": 1, "$nQaCostSetup": 1, "$nJsolWriteCostSetup": 3, "$nHostAdaptationCostSetup": 0.5, "$nJsolQaCostSetup": 1, "$nDevCostIteration": 0.3, "$nQaCostIteration": 0.5, "$nJsolWriteCostIteration": 0.4, "$nHostAdaptationCostIteration": 0.1, "$nJsolQaCostIteration": 0.3 },
     { "$qTargets": 4, "$nDevCostSetup": 2, "$nQaCostSetup": 0, "$nJsolWriteCostSetup": 7, "$nHostAdaptationCostSetup": 0, "$nJsolQaCostSetup": 0, "$nDevCostIteration": 0.8, "$nQaCostIteration": 0, "$nJsolWriteCostIteration": 20, "$nHostAdaptationCostIteration": 0, "$nJsolQaCostIteration": 0 }
   ]
 }
*/

const $mAdoptionEconomics = function(
    $qTargets,
    $nDevCostSetup, $nQaCostSetup, $nJsolWriteCostSetup, $nHostAdaptationCostSetup, $nJsolQaCostSetup,
    $nDevCostIteration, $nQaCostIteration, $nJsolWriteCostIteration, $nHostAdaptationCostIteration, $nJsolQaCostIteration
) {
    const $nSetupCostNative = $qTargets * ($nDevCostSetup + $nQaCostSetup);
    const $nSetupCostJsol = $nJsolWriteCostSetup + ($qTargets * $nHostAdaptationCostSetup) + $nJsolQaCostSetup;

    const $nIterationCostNative = $qTargets * ($nDevCostIteration + $nQaCostIteration);
    const $nIterationCostJsol = $nJsolWriteCostIteration + $nJsolQaCostIteration + ($qTargets * $nHostAdaptationCostIteration);

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
        // else: JSOL starts even or behind, and gets worse. native_always_wins stands.
    } else {
        // Iteration costs identical: setup cost alone decides, with no crossover ever.
        if ($nSetupGap <= 0) {
            $sVerdict = "jsol_wins_always";
            $nBreakEvenIterations = 0;
        }
        // else: native_always_wins stands, permanently parallel, JSOL never catches up.
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
