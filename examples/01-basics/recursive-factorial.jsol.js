// @JSOL v0.2.94

/**
 @description
 Computes n! (n factorial): the product of every integer from 1 to $qN,
 defined recursively as $qN * (n-1)!, with the base case 0! = 1.
  JSOL functions are anonymous function expressions assigned to a const,
 but the const binding already exists by the time the function body runs,
 so a function can call itself through its own assigned name. This is the
 one place recursion is idiomatic JSOL: each call is a self-contained unit
 with no shared mutable state, which keeps the JS/PHP translation direct.

@param {integer} $qN - Non-negative integer.
@returns {integer} - $qN!
*/

/**
 @contract
 {
   "cases": [
     { "$qN": 0 },
     { "$qN": 5 },
     { "$qN": 10 }
   ]
 }
*/

const $qFactorial = function($qN) {
    JSOL.use($qFactorial);
	// JSOL.use: Binds the function's own name to its internal scope, preventing 'undefined variable' in PHP recursive closures.
    
    // Base case: stops the recursion.
    if ($qN === 0) {
        return 1;
    }

    // Recursive case: n! = n * (n-1)!
    return $qN * $qFactorial($qN - 1);
};