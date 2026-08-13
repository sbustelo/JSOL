// @JSOL v0.2.91

/**
 * @description
 * Builds a fixed-installment loan amortization schedule (the "French
 * system"): every period pays the same total installment, but the split
 * between interest and principal shifts over time — interest shrinks as the
 * outstanding balance shrinks, principal grows to compensate.
 *
 * Fixed installment formula: A = P * r / (1 - (1+r)^-n), where P is the
 * loan amount, r is the periodic interest rate, and n is the number of
 * periods.
 *
 * @param {number} $nLoanAmount - Amount borrowed.
 * @param {number} $nPeriodicRate - Interest rate per period, as a decimal.
 * @param {integer} $qPeriods - Number of installments.
 * @returns {array<Map>} - One entry per period: period, interest, principal, balance.
 */

/**
 * @contract
 * {
 *   "cases": [
 *     { "$nLoanAmount": 10000, "$nPeriodicRate": 0.01, "$qPeriods": 6 }
 *   ]
 * }
 */

const $aAmortizationSchedule = function($nLoanAmount, $nPeriodicRate, $qPeriods) {
    // Fixed installment amount, constant across every period.
    const $nInstallment = $nLoanAmount * $nPeriodicRate / (1 - Math.pow(1 + $nPeriodicRate, -1 * $qPeriods));

    const $aSchedule = [];
    let $nBalance = $nLoanAmount;

    for (let $qPeriod = 1; $qPeriod <= $qPeriods; $qPeriod = $qPeriod + 1) {
        // Interest is charged on the balance still outstanding at the start
        // of this period.
        const $nInterest = $nBalance * $nPeriodicRate;
        // Whatever the installment doesn't cover in interest pays down principal.
        const $nPrincipalPaid = $nInstallment - $nInterest;
        $nBalance = $nBalance - $nPrincipalPaid;

        Arr.push($aSchedule, Map.create(
            "period", $qPeriod,
            "interest", $nInterest,
            "principal", $nPrincipalPaid,
            "balance", $nBalance
        ));
    }

    return $aSchedule;
};
