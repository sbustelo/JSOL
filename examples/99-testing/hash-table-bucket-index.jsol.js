// @JSOL v0.2.97

/**
Test: hash table bucket assignment (CLRS, chapter 11) with a hash
value that has overflowed into a negative signed integer, exactly what
happens in practice to real rolling hash functions on long enough
input (the same thing Java's String.hashCode() does).

Naive JavaScript, verified:

```js
function hashBucket(hash, numBuckets) {
  return hash % numBuckets;
}
hashBucket(-17, 8);
// -> -1
// array[-1] either reads the wrong slot silently or throws, depending
// on how the array is typed. Never a valid bucket index.
```

Naive PHP, same trap, "%" is dividend-signed like C (documented
behavior, not verified locally in this environment):

```php
function hashBucket($hash, $numBuckets) {
  return $hash % $numBuckets;
}
hashBucket(-17, 8);
// -> -1   (same bug, same reason)
```

Naive Python, verified, and here it just works:

```python
def hash_bucket(hash_value, num_buckets):
    return hash_value % num_buckets

hash_bucket(-17, 8)
# -> 7   (correct: Python's "%" keeps the sign of the divisor)
```

The textbook pseudocode "hash % numBuckets" is not portable as
written, it silently breaks in two of three real targets. Math.modX
resolves it the same way everywhere: always a valid, non-negative
bucket index when numBuckets is positive.
*/

/**
@contract
{
  "cases": [
    {
      "in": { "$nHash": -17, "$nNumBuckets": 8 },
      "expect": 7
    },
    {
      "in": { "$nHash": 17, "$nNumBuckets": 8 },
      "expect": 1
    }
  ]
}
*/

const $nHashBucket = function($nHash, $nNumBuckets) {
  return Math.modX($nHash, $nNumBuckets);
};