// @JSOL v0.2.97

/**
Test: cloning an order to build a variant must never mutate the
original, no matter how the clone is written.

Naive JavaScript, verified:

```js
function addItemToVariant(original, newItem) {
  let variant = original;
  variant.push(newItem);
  return original;
}
addItemToVariant(["laptop", "mouse"], "teclado");
// -> ["laptop", "mouse", "teclado"]
// The "original" array passed in comes back changed. "variant = original"
// copied a reference, not the array, so pushing into variant pushed
// into the same underlying array the caller still holds.
```

Naive Python, verified, same bug for the same reason (lists are
references too):

```python
def add_item_to_variant(original, new_item):
    variant = original
    variant.append(new_item)
    return original

add_item_to_variant(["laptop", "mouse"], "teclado")
# -> ['laptop', 'mouse', 'teclado']   (same bug as JS)
```

Naive PHP, and here it's safe, but by accident of the language, not
by design:

```php
function addItemToVariant($original, $newItem) {
  $variant = $original;
  array_push($variant, $newItem);
  return $original;
}
addItemToVariant(["laptop", "mouse"], "teclado");
// -> ["laptop", "mouse"]   (unchanged, PHP arrays are copy-on-write values)
```

Two of three targets corrupt the original, and the line that does it
("variant = original") reads exactly like a safe copy, so it survives
code review. Arr.* must be pass-by-value in JSOL on every target, so
this test passes for the same reason everywhere: because the language
guarantees it, not because whoever wrote it happened to pick PHP.
*/


const $aOriginalUnaffectedByClone = function($aOriginalItems, $sNewItem) {
    let $a_variant = Arr.slice($aOriginalItems, 0, Arr.len($aOriginalItems));
    Arr.push($a_variant, $sNewItem);
    return $aOriginalItems;
};

/**
@contract
{
  "cases": [
    {
      "in": { "$aOriginalItems": ["laptop", "mouse"], "$sNewItem": "teclado" },
      "expect": ["laptop", "mouse"]
    }
  ]
}
*/