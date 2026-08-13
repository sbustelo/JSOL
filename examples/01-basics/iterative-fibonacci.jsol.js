// @JSOL v0.2.91

/**
 * @description
 * Computes the $qN-th Fibonacci number (0-indexed: F(0)=0, F(1)=1,
 * F(n) = F(n-1) + F(n-2)) iteratively, using two running accumulators
 * instead of recursion.
 *
 * The naive recursive definition recomputes the same sub-values many times
 * over (F(n) calls F(n-1) and F(n-2), which each call F(n-2) and F(n-3), and
 * so on), so its cost grows exponentially with $qN. Keeping only the
 * previous two values and sliding them forward one step at a time solves it
 * in a single pass, linear in $qN.
 *
 * @param {integer} $qN - Position in the sequence, 0-indexed.
 * @returns {integer} - The $qN-th Fibonacci number.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$qN": 0 },
 *     { "$qN": 1 },
 *     { "$qN": 10 }
 *   ]
 * }
 */

const $qFibonacci = function($qN) {
    if ($qN === 0) {
        return 0;
    }
    if ($qN === 1) {
        return 1;
    }

    // $qPrev / $qCurrent hold F(i-1) and F(i) as the loop advances.
    let $qPrev = 0;
    let $qCurrent = 1;

    for (let $i = 2; $i <= $qN; $i = $i + 1) {
        const $qNext = $qPrev + $qCurrent;
        $qPrev = $qCurrent;
        $qCurrent = $qNext;
    }

    return $qCurrent;
};
