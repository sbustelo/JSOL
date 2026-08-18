// @JSOL v0.2.91

/**
 @description
 Computes the inventory reorder point: the stock level at which a new
 purchase order must be placed so the next shipment arrives before stock
 runs out. ROP = (average daily demand * lead time in days) + safety
 stock, where safety stock is a buffer against demand spikes or shipment
 delays during the lead time window.

@param {number} $nAvgDailyDemand - Average units sold or consumed per day.
@param {integer} $qLeadTimeDays - Days between placing an order and receiving it.
@param {number} $nSafetyStock - Extra buffer stock held against uncertainty.
@returns {number} - Reorder point, in units.
*/

/**
 @contract
 {
   "cases": [
     { "$nAvgDailyDemand": 40, "$qLeadTimeDays": 7, "$nSafetyStock": 50 },
     { "$nAvgDailyDemand": 5, "$qLeadTimeDays": 30, "$nSafetyStock": 0 }
   ]
 }
*/

const $nReorderPoint = function($nAvgDailyDemand, $qLeadTimeDays, $nSafetyStock) {
    return ($nAvgDailyDemand * $qLeadTimeDays) + $nSafetyStock;
};
