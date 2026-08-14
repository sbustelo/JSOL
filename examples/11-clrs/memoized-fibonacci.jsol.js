// @JSOL v0.2.91

/**
 * @description
 * Computes the $qN-th Fibonacci number using top-down memoization: the
 * same recursive definition (F(n) = F(n-1) + F(n-2)), but every result is
 * cached in $aCache the first time it is computed, so a later call asking
 * for the same value returns instantly instead of recomputing it.
 *
 * Contrast with iterative-fibonacci.jsol.js (01-basics): that version
 * never recurses at all and needs no cache. This version keeps the
 * natural recursive shape of the definition, and fixes its performance
 * with a cache instead of removing the recursion. Naive recursion without
 * a cache (not included here) recomputes every sub-value from scratch
 * every time, and its cost grows exponentially, impractical past roughly
 * $qN = 40. All three compute the same numbers; they differ only in how
 * much repeated work they do to get there.
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
 *     { "$qN": 30 }
 *   ]
 * }
 */

const $qFibonacciMemo = function($qN, $aCache) {
    if ($qN <= 1) {
        return $qN;
    }

    // -1 marks a position not yet computed; anything else is a cached result.
    if ($aCache[$qN] !== -1) {
        return $aCache[$qN];
    }

    const $qResult = $qFibonacciMemo($qN - 1, $aCache) + $qFibonacciMemo($qN - 2, $aCache);
    $aCache[$qN] = $qResult;

    return $qResult;
};

const $qMemoizedFibonacci = function($qN) {
    // $aCache: one slot per position from 0 to $qN, all starting unset (-1).
    const $aCache = [];
    for (let $i = 0; $i <= $qN; $i = $i + 1) {
        Arr.push($aCache, -1);
    }

    return $qFibonacciMemo($qN, $aCache);
};
