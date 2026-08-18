// @JSOL v0.2.91

/**
 @description
 Computes weekly gross pay from hours worked and an hourly rate, applying
 the standard overtime rule: every hour up to $nOvertimeThreshold is paid
 at the regular rate, every hour beyond it is paid at 1.5x ("time and a
 half"). The threshold is a parameter rather than a hardcoded 40 because
 it varies by jurisdiction and by labor agreement.

@param {number} $nHoursWorked - Total hours worked in the period.
@param {number} $nHourlyRate - Regular hourly pay rate.
@param {number} $nOvertimeThreshold - Hours after which overtime pay applies.
@returns {number} - Total gross pay for the period.
*/

/**
 @contract
 {
   "cases": [
     { "$nHoursWorked": 45, "$nHourlyRate": 20, "$nOvertimeThreshold": 40 },
     { "$nHoursWorked": 35, "$nHourlyRate": 20, "$nOvertimeThreshold": 40 }
   ]
 }
*/

const $nPayrollGrossPay = function($nHoursWorked, $nHourlyRate, $nOvertimeThreshold) {
    if ($nHoursWorked <= $nOvertimeThreshold) {
        return $nHoursWorked * $nHourlyRate;
    }

    const $nRegularHours = $nOvertimeThreshold;
    const $nOvertimeHours = $nHoursWorked - $nOvertimeThreshold;
    const $nOvertimeRate = $nHourlyRate * 1.5;

    return ($nRegularHours * $nHourlyRate) + ($nOvertimeHours * $nOvertimeRate);
};
