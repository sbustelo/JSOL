// @JSOL v0.2.97

/**
Test: an account whose issue count is literally "0" (a legacy string field, the kind that comes out of an old CSV export or a text column in a database) must be treated as clean, not flagged.

Naive PHP (the legacy system happens to get it right):

```php
function accountHasIssues($issueCountAsString) {
  return (bool) $issueCountAsString;
}
accountHasIssues("0");
// -> false   (correct: PHP's falsy set includes the string "0"
//             specifically, so a clean account is read as clean)
```

Naive Python, (where a PHP-to-Python migration breaks silently):

```python
def account_has_issues(issue_count_as_string):
    return bool(issue_count_as_string)

account_has_issues("0")
# -> True
# Any non-empty string is truthy in Python, "0" included. A perfectly
# clean account gets flagged as having issues, purely because the
# migration changed language, not because any business rule changed.
```

Naive JavaScript (same failure as Python, and for the same reason):

```js
function accountHasIssues(issueCountAsString) {
  return Boolean(issueCountAsString);
}
accountHasIssues("0");
// -> true   (same bug: "0" is a non-empty string, therefore truthy)
```

PHP happens to match the business intent ("0" means zero, means clean) by a quirk of its own truthiness rules, not because anyone designed it that way on purpose.
A migration audit that only compares "does the new system crash" will never catch this, the Python service runs fine, it just flags the wrong accounts.
Design decision: Cast.toBool must resolve "0" as false on every target, so the legacy system's accidental correctness survives the migration instead of depending on it.
*/



/**
@contract
{
  "cases": [
    { "in": { "$sIssueCount": "0" }, "expect": false },
    { "in": { "$sIssueCount": "" }, "expect": false },
    { "in": { "$sIssueCount": "3" }, "expect": true }
  ]
}
*/

const $bAccountHasIssues = function($sIssueCount) {
  return Cast.toBool($sIssueCount);
};