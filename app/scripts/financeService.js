'use strict';
/** FINANCE - SERVICE
 *
 *      The finance functions available on Excel or
 *       Google Sheets, such as: PMT, FV, IPMT, PPMT
 *
 *      A port of the code used on this article:
 *
 *          https://www.experts-exchange.com/articles/1948/A-Guide-to-the-PMT-FV-IPMT-and-PPMT-Functions.html
 *
 *      @author   David 'oodavid' King
 */
angular.module('fateful')
.service('financeService', [function() {

    /** PMT
     *
     *  Calculates the periodic payment for an annuity investment based on
     *   constant-amount periodic payments and a constant interest rate.
     *
     *  PMT(rate, number_of_periods, present_value, [future_value, end_or_beginning])
     *      
     *      @param  rate               -  The interest rate.
     *      @param  number_of_periods  -  The number of payments to be made.
     *      @param  present_value      -  The current value of the annuity.
     *      @param  future_value       -  [ OPTIONAL - 0 by default ] - The future value remaining after the final payment has been made.
     *      @param  end_or_beginning   -  [ OPTIONAL - 0 by default ] - Whether payments are due at the end (0) or beginning (1) of each period.
     */
    this.PMT = function(rate, number_of_periods, present_value, future_value, end_or_beginning){
        // Default values
        future_value     = future_value || 0;
        end_or_beginning = end_or_beginning || 0;
        // pmt = r / ((1 + r)^N - 1) * -(pv * (1 + r)^N + fv)
        var pmt = rate / (Math.pow(1 + rate, number_of_periods) - 1)
                * -(present_value * Math.pow(1 + rate, number_of_periods) + future_value);
        // Account for payments at beginning of period versus end.
        if(end_or_beginning == 1){
            pmt /= (1 + rate);
        }
        // And return
        return pmt;
    };
    
    /** FV
     *
     *  Calculates the future value of an annuity investment based on
     *   constant-amount periodic payments and a constant interest rate.
     *
     *  FV(rate, number_of_periods, payment_per_period, present_value, [end_or_beginning])
     *
     *      @param  rate               -  The interest rate.
     *      @param  number_of_periods  -  The number of payments to be made.
     *      @param  payment_amount     -  The amount per period to be paid.
     *      @param  present_value      -  The current value of the annuity.
     *      @param  end_or_beginning   -  [ OPTIONAL - 0 by default ] - Whether payments are due at the end (0) or beginning (1) of each period.
     */
    this.FV = function(rate, number_of_periods, payment_amount, present_value, end_or_beginning) {
        // Default values
        end_or_beginning = end_or_beginning || 0;
        // Account for payments at beginning of period versus end
        // ...since we are going in reverse, we multiply by 1 plus interest rate.
        if(end_or_beginning == 1){
            payment_amount *= (1 + rate);
        }
        // fv = -(((1 + r)^N - 1) / r * c + pv * (1 + r)^N);
        var fv = -((Math.pow(1 + rate, number_of_periods) - 1) / rate * payment_amount + present_value
                * Math.pow(1 + rate, number_of_periods));
        // And return
        return fv;
    };

    /** IPMT
     *
     *  Calculates the payment on interest for an investment based on
     *   constant-amount periodic payments and a constant interest rate.
     *
     *  IPMT(rate, period, number_of_periods, present_value, [future_value, end_or_beginning])
     *
     *      @param  rate               -  The interest rate.
     *      @param  period             -  The amortization period, in terms of number of periods. Must be at least 1 and at most number_of_periods.
     *      @param  number_of_periods  -  The number of payments to be made.
     *      @param  present_value      -  The current value of the annuity.
     *      @param  future_value       -  [ OPTIONAL - 0 by default ] - The future value remaining after the final payment has been made.
     *      @param  end_or_beginning   -  [ OPTIONAL - 0 by default ] - Whether payments are due at the end (0) or beginning (1) of each period.
     */
    this.IPMT = function(rate, period, number_of_periods, present_value, future_value, end_or_beginning) {
        // Default values
        future_value     = future_value || 0;
        end_or_beginning = end_or_beginning || 0;
        // Prior period (i.e., per-1) balance times periodic interest rate.
        // i.e., ipmt = fv(r, per-1, c, pv, type) * r
        // where c = pmt(r, nper, pv, fv, type)
        var ipmt = this.FV(rate, period - 1, this.PMT(rate, number_of_periods, present_value, future_value, end_or_beginning), present_value, end_or_beginning) * rate;
        // account for payments at beginning of period versus end.
        if (end_or_beginning == 1){
            ipmt /= (1 + rate);
        }
        // return results to caller.
        return ipmt;
    };
    
    /** PPMT
     *
     *  Calculates the payment on the principal of an investment based on
     *   constant-amount periodic payments and a constant interest rate.
     *
     *  PPMT(rate, period, number_of_periods, present_value, [future_value, end_or_beginning])
     *
     *      @param  rate               -  The interest rate.
     *      @param  period             -  The amortization period, in terms of number of periods. Must be at least 1 and at most number_of_periods.
     *      @param  number_of_periods  -  The number of payments to be made.
     *      @param  present_value      -  The current value of the annuity.
     *      @param  future_value       -  [ OPTIONAL - 0 by default ] - The future value remaining after the final payment has been made.
     *      @param  end_or_beginning   -  [ OPTIONAL - 0 by default ] - Whether payments are due at the end (0) or beginning (1) of each period.
     */
    this.PPMT = function(rate, period, number_of_periods, present_value, future_value, end_or_beginning){
        // Default values
        future_value     = future_value || 0;
        end_or_beginning = end_or_beginning || 0;
        // Calculated payment per period minus interest portion of that period.
        // i.e., ppmt = c - i
        // where c = pmt(r, nper, pv, fv, type)
        // and i = ipmt(r, per, nper, pv, fv, type)
        return this.PMT(rate, number_of_periods, present_value, future_value, end_or_beginning)
              - this.IPMT(rate, period, number_of_periods, present_value, future_value, end_or_beginning);
    };
}]);