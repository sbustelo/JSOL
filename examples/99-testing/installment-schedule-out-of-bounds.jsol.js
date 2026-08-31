// @JSOL v0.2.97

/**
Test: reading an installment out of a fixed 12-month payment schedule by an index that doesn't exist (an off-by-one loop bug, or a plan that changed length without the caller knowing).

Naive JavaScript:

```js
function installmentAmount(schedule, monthIndex) {
  return schedule[monthIndex] + 0;
}
installmentAmount([100, 100, 100], 12);
// -> NaN
// No error, no warning. NaN quietly flows into every calculation
// downstream, and can end up printed as "$NaN" on a real statement.
```

Naive PHP: reading an undefined array offset emits a non-fatal
warning and returns null, execution continues.

```php
function installmentAmount($schedule, $monthIndex) {
  return $schedule[$monthIndex] + 0;
}
installmentAmount([100, 100, 100], 12);
// -> 0, with a warning logged (if warnings are even being watched)
```

Naive Python:

```python
def installment_amount(schedule, month_index):
    return schedule[month_index] + 0

installment_amount([100, 100, 100], 12)
# -> IndexError: list index out of range
```

This is a case where "the new system is more fragile" would be the wrong read. The PHP version was never correct, and would have been quietly producing wrong numbers (or silent zeros) for months, possibly already visible somewhere as a broken statement nobody investigated. The Python version doesn't introduce a new bug, it just refuses to hide the old one. 
This drives a design decision: Arr.* access must be Fallible on every target (an explicit,
non-throwing OUT_OF_BOUNDS signal), so the decision of what "index doesn't exist" means belongs to the business logic, not to whichever target happened to compile it that day.
*/

/**
@contract
{
  "cases": [
    { "in": { "$aSchedule": [100, 100, 100], "$nMonthIndex": 1 }, "expect": 100 }
  ]
}
*/

const $nInstallmentPlusZero = function($aSchedule, $nMonthIndex) {
  return $aSchedule[$nMonthIndex] + 0;
};