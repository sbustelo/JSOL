// @JSOL v0.2.97

/**
Test: literal string replacement must never reinterpret special
tokens inside the replacement value.

Naive JavaScript, verified:

```js
function buildNotice(template, placeholder, replacement) {
  return template.replace(placeholder, replacement);
}
buildNotice("Total a pagar: MONTO", "MONTO", "$&");
// -> "Total a pagar: MONTO"
// Looks like nothing happened. It didn't insert "$&" literally, it
// re-inserted the matched text ("MONTO") in its place. If "$&" was
// meant to be a literal reference code, it silently vanished.
```

Naive PHP, verified against documented behavior (str_replace is a
byte-for-byte literal operation, no meta-characters):

```php
function buildNotice($template, $placeholder, $replacement) {
  return str_replace($placeholder, $replacement, $template);
}
buildNotice("Total a pagar: MONTO", "MONTO", "$&");
// -> "Total a pagar: $&"   (correct, PHP has nothing to fix here)
```

Naive Python, same story as PHP (str.replace is always literal):

```python
def build_notice(template, placeholder, replacement):
    return template.replace(placeholder, replacement)

build_notice("Total a pagar: MONTO", "MONTO", "$&")
# -> "Total a pagar: $&"   (correct, Python has nothing to fix here)
```

Only one of the three targets is broken, and it is broken silently,
which is worse than a crash: the output still reads as plausible
text. JSOL's Str.replaceAll must compile to something on the JS side
that is immune to this (split+join instead of native replace, for
example) so the source line means the same thing everywhere without
the author needing to know this is a JS-only footgun.
*/

/**
@contract
{
  "cases": [
    {
      "in": { "$sTemplate": "Total a pagar: MONTO", "$sPlaceholder": "MONTO", "$sReplacement": "$&" },
      "expect": "Total a pagar: $&"
    },
    {
      "in": { "$sTemplate": "Saldo anterior: MONTO", "$sPlaceholder": "MONTO", "$sReplacement": "$100.000" },
      "expect": "Saldo anterior: $100.000"
    },
    {
      "in": { "$sTemplate": "Referencia: MONTO", "$sPlaceholder": "MONTO", "$sReplacement": "$$$$" },
      "expect": "Referencia: $$$$"
    }
  ]
}
*/

const $sBuildNotice = function($sTemplate, $sPlaceholder, $sReplacement) {
  return Str.replaceAll($sTemplate, $sPlaceholder, $sReplacement);
};