// @JSOL v0.2.97

/**
Test: days remaining until the next subscription billing date, once
today's date has already passed this month's billing day.

Naive JavaScript, verified:

```js
function daysUntilNextBilling(billingDay, today, cycleDays) {
  return (billingDay - today) % cycleDays;
}
daysUntilNextBilling(5, 20, 30);
// -> -15
// "-15 days until the next charge" is meaningless. The native "%"
// keeps the sign of the dividend, so once you're past the billing
// day the result goes negative instead of wrapping to the next cycle.
```

Naive PHP, same trap, "%" is dividend-signed like C:

```php
function daysUntilNextBilling($billingDay, $today, $cycleDays) {
  return ($billingDay - $today) % $cycleDays;
}
daysUntilNextBilling(5, 20, 30);
// -> -15   (same bug, same reason)
```

Naive Python, verified, and here it just works:

```python
def days_until_next_billing(billing_day, today, cycle_days):
    return (billing_day - today) % cycle_days

days_until_next_billing(5, 20, 30)
# -> 15   (correct: Python's "%" keeps the sign of the divisor,
#          which happens to match the Excel MOD convention)
```

Two of three targets need a manual fix here (the classic
"((x % n) + n) % n" workaround developers reinvent by hand every
time), one doesn't. That asymmetry is exactly the kind of detail
nobody remembers correctly under pressure. Math.modX picks the
divisor-sign convention once, for every target, so the same line
means the same thing regardless of which of the three happens to be
running it.
*/

/**
@contract
{
  "cases": [
    {
      "in": { "$nBillingDay": 5, "$nToday": 20, "$nCycleDays": 30 },
      "expect": 15
    },
    {
      "in": { "$nBillingDay": 5, "$nToday": 1, "$nCycleDays": 30 },
      "expect": 4
    }
  ]
}
*/

const $nDaysUntilNextBilling = function ($nBillingDay, $nToday, $nCycleDays) {
  return Math.modX($nBillingDay - $nToday, $nCycleDays);
};