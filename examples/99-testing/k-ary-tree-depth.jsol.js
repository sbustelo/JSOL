// @JSOL v0.2.97

/**
Test: depth of a perfectly balanced k-ary tree with n leaves, computed
as ceil(log_k(n)). With n=27 leaves and branching factor 3 (27 = 3^3),
the true answer is exactly 3.

Naive JavaScript (Node/V8), verified:

```js
function karyTreeDepth(leaves, branchingFactor) {
  return Math.ceil(Math.log(leaves) / Math.log(branchingFactor));
}
karyTreeDepth(27, 3);
// -> 4
// Math.log(27)/Math.log(3) evaluates to 3.0000000000000004 in V8, one
// bit above the true value. ceil() of that silently returns one level
// too many.
```

Naive Python, verified, and here it lands exactly on 3:

```python
import math

def kary_tree_depth(leaves, branching_factor):
    return math.ceil(math.log(leaves) / math.log(branching_factor))

kary_tree_depth(27, 3)
# -> 3   (glibc's log() happens to round this particular case cleanly)
```

Important honesty check: Python is not "correct by design" here, it
got lucky with this specific input on this specific libm. ECMA-262
explicitly does not require exact precision for Math.pow/Math.log
across engines, so this is not a bug either engine is obligated to
fix, and a future glibc or a different Python build could round this
exact expression the other way. This is not a logic bug like the
other examples, it's proof that "same algorithm, same language
family" is not enough for determinism when the algorithm leans on a
transcendental function. Math.logX must not be implemented as
log(x)/log(b) division when a native base-N primitive exists, and
where it doesn't, needs a portable, non-native algorithm, precisely
because no target's native math library will sign a contract on the
last bit.
*/


/**
@contract
{
  "cases": [
    {
      "in": { "$nLeaves": 27, "$nBranchingFactor": 3 },
      "expect": 3
    },
    {
      "in": { "$nLeaves": 9, "$nBranchingFactor": 3 },
      "expect": 2
    }
  ]
}
*/

const $nKaryTreeDepth = function ($nLeaves, $nBranchingFactor) {
  return Math.ceil(Math.logX($nLeaves, $nBranchingFactor));
};