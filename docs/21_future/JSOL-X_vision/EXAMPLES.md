# JSOL-X Examples

> **Status: Vision / Pre-specification.** These examples demonstrate what JSOL-X source code looks like and how it maps to Excel spreadsheets. No compiler exists yet to produce these outputs. They exist to validate the language design against real business logic and to serve as test cases for a future compiler. See `JSOL-X_README.md` for context.

* * *

### A note on function naming

In JSOL-X, every function name begins with a single character that declares the type of value it returns. This is the same prefix system used for variables (see `JSOL-X_LANGUAGE_SPEC.md`, Part I, Section 1). A function named `$bValidateLuhn` returns a Boolean (`$b`). A function named `$cCalculateCommission` returns Currency (`$c`). A function named `$qCalculateSum` returns a Quantity, an integer (`$q`).

This is not decorative. It tells the compiler what Excel format to apply to the cell that holds the function's result. It also tells a human reader — including an auditor who has never written a line of code — what kind of value to expect, before they read a single line of logic.

All formulas in the Excel output use English function names (`IF`, `VLOOKUP`, `SUM`, `TRUE`, `FALSE`), as required by the specification. Excel automatically displays them in the user's interface language when the file is opened.

* * *

## Example 1: Luhn Algorithm (Credit Card Validation)

### What this calculates

The Luhn algorithm is a checksum formula used by payment systems worldwide to detect typos in credit card numbers. Given a string of digits, it produces a single check digit. If that digit is zero, the number is valid.

The algorithm works from right to left. For every second digit, it doubles the value. If doubling produces a number greater than 9, it subtracts 9. It sums all resulting digits. If the total is divisible by 10, the card number passes.

This example is useful because it demonstrates three things at once: string indexing into individual characters, a backward loop with conditional doubling, and accumulation across iterations — all of which must map cleanly to Excel rows.

### JSOL-X Source

// @JSOL-X
const $bValidateLuhn = function($sNumber) {
    const $qSum = $qCalculateLuhnSum($sNumber);
    return $qSum % 10 === 0;
};
const $qCalculateLuhnSum = function($sNumber) {
    const $qDigits = Str.len($sNumber);
    let $qSum = 0;
    let $bDouble = false;
    for (let $i of JSOL.range($qDigits - 1, -1, -1, 20)) {
        const $qDigit = Cast.toInt(Str.sub($sNumber, $i, $i + 1));
        const $qValue = $bDouble ? $qDoubleDigit($qDigit) : $qDigit;
        $qSum = $qSum + $qValue;
        $bDouble = !$bDouble;
    }
    return $qSum;
};
const $qDoubleDigit = function($qDigit) {
    const $qDoubled = $qDigit \* 2;
    return $qDoubled > 9 ? $qDoubled - 9 : $qDoubled;
};

### How to read this code

The first function, `$bValidateLuhn`, takes a string `$sNumber` and returns a Boolean. Its name begins with `$b`, so we know the answer is TRUE or FALSE. It calls a helper function and checks whether the result is divisible by 10.

The second function, `$qCalculateLuhnSum`, does the real work. Its name begins with `$q`, telling us it returns an integer — the sum of all processed digits. It uses `Str.len` to count how many digits are in the card number. Then it sets up two variables using `let` rather than `const`: `$qSum` (the running total, starting at zero) and `$bDouble` (a flag that toggles between TRUE and FALSE as we move through the digits).

The `let` keyword is the one exception to JSOL-X's immutability rule. Inside a `JSOL.range` loop, variables declared with `let` are allowed to change their value. In Excel, each row looks at the row above it to get the previous value. This is how accumulation works in a spreadsheet.

The loop itself uses `JSOL.range($qDigits - 1, -1, -1, 20)`. Let's unpack those four arguments:

-   First argument: start at the last digit (position `$qDigits - 1`). For a 16-digit card, that's position 15.
-   Second argument: stop before position -1. Since the step is negative, we stop when we reach or pass -1.
-   Third argument: step by -1 each time, meaning we move right to left.
-   Fourth argument: 20. This is a hard cap. The compiler will draw exactly 20 rows in Excel. If the card has fewer than 20 digits, the extra rows will be hidden by the Gatekeeper. Twenty is more than enough for any standard payment card.

Inside the loop body, we extract a single character from the string using `Str.sub($sNumber, $i, $i + 1)`, which in Excel becomes `=MID(...)`. We convert it to an integer with `Cast.toInt`. If the `$bDouble` flag is TRUE, we pass the digit through `$qDoubleDigit`, which doubles it and subtracts 9 if needed. Otherwise we use the digit as-is. We add the resulting value to `$qSum`, and flip the `$bDouble` flag.

The third function, `$qDoubleDigit`, is pure calculation: double the digit, and if the result exceeds 9, subtract 9. No loops, no state, just arithmetic.

### Expected Excel Output

**Sheet: Dashboard**

This is the sheet the user sees and interacts with.

| Row | A   | B   |
| --- | --- | --- |
| 1   | Card Number | Valid |
| 2   | _(yellow cell, user types here)_ | `=Engine!F1=0` |

Row 1 contains headers. Row 2 contains the interaction layer. Cell A2 has a yellow background, signaling "you can type here." Cell B2 displays TRUE if the card number in A2 passes the Luhn check, FALSE otherwise. It references cell F1 on the Engine sheet, which holds the final sum modulo 10.

If the user wants to test multiple card numbers at once, they copy Row 2 and paste it into Rows 3, 4, and so on. Each row works independently.

**Sheet: Engine**

This sheet is hidden from the user. It contains the unrolled loop, one row per iteration, up to the hard cap of 20.

The Gatekeeper formula wraps every cell in every row. The pattern is: if the logical index for this row is valid, run the calculation; otherwise, show nothing. This prevents Excel from displaying errors when the actual loop finishes before the hard cap. The Gatekeeper for Row N is `=IF(LogicalIndex_N >= 0, [formula], "")`.

| Row | A ($i) | B (digit) | C ($bDouble) | D ($qValue) | E ($qSum) | F (output) |
| --- | --- | --- | --- | --- | --- | --- |
| 1   | 15  | 6   | FALSE | `=IF(C1, EngineHelper!A1, B1)` | 6   | `=IF(A1>=0, E1, 0)` |
| 2   | 14  | 3   | `=NOT(C1)` | `=IF(C2, EngineHelper!A2, B2)` | `=E1+D2` |     |
| 3   | 13  | 0   | `=NOT(C2)` | `=IF(C3, EngineHelper!A3, B3)` | `=E2+D3` |     |
| ... | ... | ... | ... | ... | ... |     |

Let's walk through Row 1 in detail.

Column A holds the logical index `$i`. It starts at 15 and decrements by 1 each row. Row 1 gets 15, Row 2 gets 14, and so on.

Column B extracts a single digit from the card number. In Excel, this is `=MID(Dashboard!A2, A1+1, 1)`. We add 1 because Excel's `MID` function counts positions starting at 1, while our `$i` index starts at 15 (the last character, counting from zero).

Column C holds the `$bDouble` flag. Row 1 starts at FALSE. Each subsequent row inverts the previous row's value: `=NOT(C1)` in Row 2, `=NOT(C2)` in Row 3. This is the "row above reference" pattern that implements mutation inside a loop.

Column D calculates the processed digit value. If `$bDouble` is FALSE, it uses the raw digit from Column B. If TRUE, it looks up the doubled-and-adjusted value from a small helper table on another sheet. The lookup is `=IF(C1, VLOOKUP(B1, EngineHelper!A:B, 2, FALSE), B1)`.

Column E accumulates the running sum. Row 1 starts with its own value from Column D. Each subsequent row adds its own value to the previous row's sum: `=E1+D2`, `=E2+D3`, and so on.

Column F holds the final output. Only F1 matters: it is the accumulated sum from the last valid row. The Dashboard sheet references this cell.

**Sheet: EngineHelper**

This tiny sheet precomputes the doubled-and-adjusted values for digits 0 through 9. It exists so the main Engine sheet can use a simple `VLOOKUP` instead of embedding the doubling logic in every row.

| Row | A (digit) | B (doubled & adjusted) |
| --- | --- | --- |
| 1   | 0   | 0   |
| 2   | 1   | 2   |
| 3   | 2   | 4   |
| 4   | 3   | 6   |
| 5   | 4   | 8   |
| 6   | 5   | 1   |
| 7   | 6   | 3   |
| 8   | 7   | 5   |
| 9   | 8   | 7   |
| 10  | 9   | 9   |

For digit 6: 6 × 2 = 12, 12 > 9 so 12 − 9 = 3. Row 7 confirms this.  
For digit 8: 8 × 2 = 16, 16 > 9 so 16 − 9 = 7. Row 9 confirms this.  
For digit 5: 5 × 2 = 10, 10 > 9 so 10 − 9 = 1. Row 6 confirms this.

### Why this example matters

The Luhn algorithm forces the compiler to handle: backward iteration, conditional logic inside a loop, a toggle flag that flips every row, accumulation across rows, and a helper function extracted to its own sheet. If a compiler can produce working Excel for Luhn, it can handle most business logic patterns.

* * *

## Example 2: Tiered Commissions

### What this calculates

A salesperson earns commission at different rates depending on how much they sell. The first $100,000 earns 5%. The next $100,000 (from $100,000 to $200,000) earns 7%. Anything above $200,000 earns 10%.

This is called a tiered or progressive commission structure. It is common in sales compensation, insurance, and financial services. The calculation must show the breakdown by tier so both the salesperson and the finance department can verify any given payout.

### JSOL-X Source

// @JSOL-X
const $cCalculateCommission = function($cTotalSales) {
    const $cTier1 = $cCalculateTier($cTotalSales, 0, 100000, 0.05);
    const $cTier2 = $cCalculateTier($cTotalSales, 100000, 200000, 0.07);
    const $cTier3 = $cCalculateTier($cTotalSales, 200000, 999999999, 0.10);
    return $cTier1 + $cTier2 + $cTier3;
};
const $cCalculateTier = function($cTotal, $cFrom, $cTo, $pRate) {
    const $bHasTier = $cTotal > $cFrom;
    const $cTierBase = $bHasTier ? ($cTotal < $cTo ? $cTotal : $cTo) : $cFrom;
    const $cTierAmount = $cTierBase - $cFrom;
    return $cTierAmount \* $pRate;
};

### How to read this code

`$cCalculateCommission` returns Currency. It breaks the total sales into three tiers and calls `$cCalculateTier` for each one. The result is the sum of the three tier commissions.

`$cCalculateTier` also returns Currency. It takes four arguments: the total sales amount, the lower bound of the tier, the upper bound of the tier, and the commission rate for that tier (a Percentage).

The logic inside `$cCalculateTier` answers three questions in sequence:

First: is there any money in this tier at all? If total sales are below the lower bound, the answer is no, and the tier commission is zero. `$bHasTier` captures this as a Boolean.

Second: how much money falls within this tier? If total sales exceed the upper bound, the answer is the full width of the tier (`$cTo - $cFrom`). If total sales fall inside the tier, the answer is the portion above the lower bound (`$cTotal - $cFrom`). The ternary `($cTotal < $cTo ? $cTotal : $cTo)` picks the smaller of the two — total sales or the tier's upper bound — and that becomes the ceiling from which we subtract the lower bound.

Third: multiply that tier amount by the rate.

### Expected Excel Output

**Sheet: Dashboard**

| Row | A   | B   | C   | D   | E   |
| --- | --- | --- | --- | --- | --- |
| 1   | Total Sales | Tier 1 (5%) | Tier 2 (7%) | Tier 3 (10%) | Total Commission |
| 2   | _(yellow)_ | `=IF(A2>0, IF(A2<100000, A2, 100000)*0.05, 0)` | `=IF(A2>100000, IF(A2<200000, A2-100000, 100000)*0.07, 0)` | `=IF(A2>200000, (A2-200000)*0.10, 0)` | `=B2+C2+D2` |

Row 1 shows what each column represents. The user types a sales figure in A2. Columns B, C, and D show how much commission was earned in each tier. Column E shows the total.

The formulas in B2, C2, and D2 are the inlined expansion of `$cCalculateTier`. Since this function is small and called only three times with different constants, inlining is appropriate — it avoids creating a separate support sheet for a few lines of arithmetic.

If the user types 150000 in A2, they see: Tier 1 = $5,000 (5% of $100,000), Tier 2 = $3,500 (7% of $50,000), Tier 3 = $0. Total = $8,500.

If they type 250000: Tier 1 = $5,000, Tier 2 = $7,000, Tier 3 = $5,000. Total = $17,000.

* * *

## Example 3: Progressive Income Tax with Reference Table

### What this calculates

Income tax using a bracket table. The tax code defines income ranges and rates. Income that falls within a range is taxed at that range's rate. The calculation must reference the table, not hardcode the numbers, so that when tax law changes, only the table needs updating.

### JSOL-X Source

// @JSOL-X
const $mTaxBrackets = Map.create(
    "threshold", Arr.create(0, 10000, 30000, 70000, 999999999),
    "rate", Arr.create(0.00, 0.10, 0.18, 0.25, 0.35)
);
const $cCalculateIncomeTax = function($cAnnualIncome) {
    const $qBrackets = Arr.count($mTaxBrackets.threshold);
    let $cTax = 0;
    for (let $i of JSOL.range(1, $qBrackets, 1, 10)) {
        const $cPrevThreshold = $mTaxBrackets.threshold\[$i - 1\];
        const $cCurrThreshold = $mTaxBrackets.threshold\[$i\];
        const $pRate = $mTaxBrackets.rate\[$i\];
        const $cBracketBase = $cCalculateBracketBase($cAnnualIncome, $cPrevThreshold, $cCurrThreshold);
        $cTax = $cTax + ($cBracketBase \* $pRate);
    }
    return $cTax;
};
const $cCalculateBracketBase = function($cIncome, $cFrom, $cTo) {
    const $bExceedsBracket = $cIncome > $cFrom;
    const $cBracketCeiling = $cIncome < $cTo ? $cIncome : $cTo;
    return $bExceedsBracket ? $cBracketCeiling - $cFrom : 0;
};

### How to read this code

`$mTaxBrackets` is a Map — a two-column table. The `threshold` column holds the lower bound of each tax bracket. The `rate` column holds the tax rate for income above that threshold. The values are paired by position: threshold\[0\] and rate\[0\] go together, threshold\[1\] and rate\[1\] go together, and so on.

Note that the first threshold is 0 and the first rate is 0.00. This means income from 0 to 10,000 is taxed at 0%. The last threshold is a very large number (999,999,999), acting as "infinity" — any income above 70,000 falls into this bracket.

`$cCalculateIncomeTax` loops over the brackets starting from index 1 (the second bracket, since we compare against the previous threshold). For each bracket, it gets the lower bound from the previous row, the upper bound from the current row, and the rate from the current row. It calculates how much income falls within that bracket using `$cCalculateBracketBase`, multiplies by the rate, and adds to the running total.

`$cCalculateBracketBase` is identical in logic to `$cCalculateTier` from the previous example. It determines the portion of income that falls within a given range. The only difference is the naming: "bracket" instead of "tier," because that's the vocabulary of tax law.

### Expected Excel Output

**Sheet: Dashboard**

| Row | A   | B   |
| --- | --- | --- |
| 1   | Annual Income | Tax Owed |
| 2   | _(yellow)_ | `=Engine!F4` |

**Sheet: TaxTable**

This sheet holds the bracket definitions. It is generated from `$mTaxBrackets`.

| Row | A (threshold) | B (rate) |
| --- | --- | --- |
| 1   | 0   | 0.00 |
| 2   | 10000 | 0.10 |
| 3   | 30000 | 0.18 |
| 4   | 70000 | 0.25 |
| 5   | 999999999 | 0.35 |

**Sheet: Engine**

The loop runs for `$qBrackets` = 5 iterations, with a hard cap of 10 rows (Max=10). Only the first 4 rows contain active calculations; Row 5's bracket extends to infinity and is the last one processed.

| Row | A (from) | B (to) | C (rate) | D (bracket base) | E (bracket tax) | F (accumulated) |
| --- | --- | --- | --- | --- | --- | --- |
| 1   | `=TaxTable!A1` | `=TaxTable!A2` | `=TaxTable!B2` | `=IF(Dashboard!A2>A1, IF(Dashboard!A2<B1, Dashboard!A2, B1)-A1, 0)` | `=D1*C1` | `=E1` |
| 2   | `=TaxTable!A2` | `=TaxTable!A3` | `=TaxTable!B3` | `=IF(Dashboard!A2>A2, IF(Dashboard!A2<B2, Dashboard!A2, B2)-A2, 0)` | `=D2*C2` | `=F1+E2` |
| 3   | `=TaxTable!A3` | `=TaxTable!A4` | `=TaxTable!B4` | `=IF(...)` | `=D3*C3` | `=F2+E3` |
| 4   | `=TaxTable!A4` | `=TaxTable!A5` | `=TaxTable!B5` | `=IF(...)` | `=D4*C4` | `=F3+E4` |
| 5   | _(gatekeeper)_ |     |     |     |     |     |

Cell F4 holds the total tax, referenced by the Dashboard.

### Why this example matters

It demonstrates a reference table (`$m`) compiled to a separate sheet, a loop that iterates over that table's rows, cross-sheet references between Dashboard, TaxTable, and Engine, and the same accumulation pattern as Luhn but applied to financial arithmetic. This is the pattern for any calculation driven by a lookup table: insurance premiums, shipping rates, discount schedules, tax withholding.

* * *

## Example 4: Volume Discount with Price Floor

### What this calculates

An e-commerce system offers discounts based on quantity purchased. Buying 1-9 units: no discount. 10-49 units: 5% off. 50-99 units: 10% off. 100-499 units: 15% off. 500 or more: 20% off.

However, there is a constraint: the final price per unit must never fall below a minimum cost of $30.00. If the discount would push the price below $30.00, the system charges $30.00 instead.

This combines a lookup table (discount by quantity range) with a floor constraint (minimum price). The two rules interact: you can't just apply the discount and call it done; you must check the result against the floor.

### JSOL-X Source

// @JSOL-X
const $mDiscountScale = Map.create(
    "minQty", Arr.create(1, 10, 50, 100, 500),
    "discount", Arr.create(0, 5, 10, 15, 20)
);
const $cBaseUnitPrice = 45.00;
const $cMinimumCost = 30.00;
const $cCalculateFinalPrice = function($qQuantity) {
    const $pDiscount = $pGetDiscount($qQuantity);
    const $cGrossPrice = $cBaseUnitPrice \* $qQuantity;
    const $cDiscountedPrice = $cGrossPrice \* (1 - $pDiscount / 100);
    const $cMinimumRequired = $cMinimumCost \* $qQuantity;
    return $cDiscountedPrice > $cMinimumRequired ? $cDiscountedPrice : $cMinimumRequired;
};
const $pGetDiscount = function($qQuantity) {
    const $qTiers = Arr.count($mDiscountScale.minQty);
    let $pResult = 0;
    for (let $i of JSOL.range(0, $qTiers - 1, 1, 10)) {
        const $qFrom = $mDiscountScale.minQty\[$i\];
        const $qTo = $mDiscountScale.minQty\[$i + 1\];
        const $bInThisTier = $qQuantity >= $qFrom && $qQuantity < $qTo;
        $pResult = $bInThisTier ? $mDiscountScale.discount\[$i\] : $pResult;
    }
    return $pResult;
};

### How to read this code

The discount scale is defined as a Map. The `minQty` column lists the thresholds at which discount levels change. The `discount` column lists the percentage discount for quantities at or above that threshold. The first row says: for quantities 1 through 9, discount is 0%. The second row says: for quantities 10 through 49, discount is 5%. And so on.

Note that the discount percentages are stored as whole numbers (5, 10, 15, 20), not as decimals (0.05, 0.10). This is because they are Percentage type (`$p`). The compiler handles the division by 100 when generating Excel formulas. In the source code, we write `$pDiscount / 100` to convert back to a decimal multiplier.

`$pGetDiscount` returns a Percentage. It loops through the discount tiers to find which tier the requested quantity falls into. The loop goes from index 0 to `$qTiers - 2`, because we compare each tier's `minQty` with the next tier's `minQty` to form a range. The flag `$bInThisTier` is TRUE if the quantity is at or above the current tier's minimum and strictly below the next tier's minimum. The variable `$pResult` is updated to the current tier's discount if we're in that tier; otherwise it keeps its previous value. After the loop, `$pResult` holds the applicable discount.

`$cCalculateFinalPrice` returns Currency. It gets the discount percentage, computes the gross price (base price times quantity), applies the discount, computes the minimum allowed price (minimum cost times quantity), and returns whichever is larger: the discounted price or the minimum.

### Expected Excel Output

**Sheet: Dashboard**

| Row | A   | B   | C   | D   | E   | F   |
| --- | --- | --- | --- | --- | --- | --- |
| 1   | Quantity | Discount % | Gross Price | Discounted Price | Minimum Required | Final Price |
| 2   | _(yellow)_ | `=VLOOKUP(A2, DiscountTable!A:B, 2, TRUE)` | `=45*A2` | `=C2*(1-B2/100)` | `=30*A2` | `=IF(D2>E2, D2, E2)` |

**Sheet: DiscountTable**

| Row | A (minQty) | B (discount %) |
| --- | --- | --- |
| 1   | 1   | 0   |
| 2   | 10  | 5   |
| 3   | 50  | 10  |
| 4   | 100 | 15  |
| 5   | 500 | 20  |

The `VLOOKUP` in Dashboard!B2 uses `TRUE` as the fourth argument, which enables range lookup. For a quantity of 75, `VLOOKUP` finds the row with minQty = 50 (the largest value less than or equal to 75) and returns the corresponding discount of 10%.

### Why this example matters

It demonstrates a lookup table with range matching (`VLOOKUP(..., TRUE)`), a calculation with a floor constraint (the `IF(D2>E2, D2, E2)` pattern), and the interaction between two business rules (discount scale and minimum price) that must both be visible and auditable in the spreadsheet.

---

*This document was produced with systematic AI co-piloting as described in [AI_ENGINEERING_METHODOLOGY.md](../../10_dev/AI_ENGINEERING_METHODOLOGY.md). AI was used for architectural stress-testing, cross-model validation, and drafting; all content has been reviewed for technical accuracy and adherence to project constraints.*

* * *

_JSOL v0.2 — 2026-08-10, [Santiago Bustelo](https://www.bustelo.com.ar/) • [MIT License](../../LICENSE)_