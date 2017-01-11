'use strict';
/** LOAN - FACTORY
 *
 *  Loans allow the user instant access to cash in the bank.
 *   In return, they accrue (compount) interest, payable over
 *   the lifetime of the loan. This Class allows the usual
 *   interactions with Loans; overpayment and payment holidays.
 *
 *      Properties
 *          loan.chart  -  Google Chart Data Object
 *          See init logic for others
 *
 *      Methods
 *          new Loan({ name, amount, apr, term })  -  Initializes the loan
 *          loan.setRecurringOverpayment(value)    -  Sets a regular overpayment
 *          loan.makeOverpayment(value)            -  Makes a one-off overpayment
 *          loan.startPaymentHoliday(months)       -  Starts a payment holiday
 *
 *      Events
 *          loan.on('paid', function(){ ... })     -  Triggered when the Loan has been completely paid off
 *
 *  TODO
 *
 *      Payday Loans don't use APR, should we cater for them?
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .factory('Loan', ['gameLoop', 'financeService', 'ledgerService', 'emitterService', function(gameLoop, financeService, ledgerService, emitterService){
        // Instantiation
        function Loan(props){
            var _this = this;
            // Basic settings
            this.name        = props.name;
            this.amount      = props.amount;
            this.apr         = props.apr;
            this.term        = props.term;
            this.start       = new Date(gameLoop.date);
            this.basicPayment = -financeService.PMT(this.apr/12, this.term, this.amount);
            // The log and running totals
            this.payments    = [];
            this.lastPayment = null; // Pointer to the last payment object
            this.total = {
                payment:   0, // Total amount paid
                principal: 0, // ...of which was principal
                interest:  0, // ...of which was interest
            };
            // User settings
            this.regularOverpayment = 0; // Recurring overpayment amount - added to every monthly payment
            this.oneOffOverpayment  = 0; // One-Off overpayment amount - added to the NEXT monthly payment
            this.paymentHoliday     = 0; // Number of months to skip
            // This is an Event Emitter
            emitterService.addLogicTo(this);
            // Initialize the chart  
            this.initChart();
            // Make a payment for every tick
            var task = gameLoop.on('tick', function(){
                _this.makeMonthlyPayment();
                if(_this.lastPayment.end_balance <= 0){
                    gameLoop.off(task);
                    _this.trigger('paid');
                }
            });
        };
        // Adds a payment
        Loan.prototype.addPayment = function(interest, payment, overpayment){
            // Only if we have anything to pay
            var start_balance = this.lastPayment ? this.lastPayment.end_balance : this.amount;
            if(start_balance <= 0){
                return;
            }
            // Calculate the principal and end_balance
            var principal = payment + overpayment - interest;
            var end_balance = start_balance - principal;
            // Make sure we don't pay too much
            if(end_balance < 0){
                overpayment += end_balance;
                if(overpayment < 0){
                    payment += overpayment;
                    overpayment = 0;
                }
                principal = payment + overpayment - interest;
                end_balance = 0;
            }
            // Add to our payments list
            this.lastPayment = {
                start_balance: start_balance,
                payment: payment,
                interest: interest,
                overpayment: overpayment,
                principal: principal,
                end_balance: end_balance,
            };
            this.payments.push(this.lastPayment);
            // Update our totals
            this.total.payment += payment + overpayment;
            this.total.principal += principal;
            this.total.interest += interest;
            // Add the changes to the ledger
            ledgerService.track({
                type: 'loan',
                name: this.name,
                value: (payment+overpayment),
                interest: interest
            });
            // Add to the chart
            this.addChartRow(this.lastPayment);
        };
        // Calculates monthly interest, and makes a payment
        Loan.prototype.makeMonthlyPayment = function(){
            // Calculate the interest, payment and overpayment
            var start_balance = this.lastPayment ? this.lastPayment.end_balance : this.amount;
            var interest = start_balance * (this.apr/12);
            var payment = 0;
            var overpayment = 0;
            if(this.paymentHoliday == 0){
                var payment = -financeService.PMT(this.apr/12, this.term, this.amount);
                var overpayment = this.regularOverpayment + this.oneOffOverpayment;
                this.oneOffOverpayment = 0; // Reset this
            } else {
                this.paymentHoliday --;
            }
            // Add the payment
            this.addPayment(interest, payment, overpayment);
        };
        // Sets a regular overpayment amount, applied during makeMonthlyPayment
        Loan.prototype.setRecurringOverpayment = function(overpayment){
            this.regularOverpayment = overpayment;
        };
        // Sets an overpayment for the next cycle
        Loan.prototype.makeOverpayment = function(overpayment){
            this.oneOffOverpayment = overpayment;
        };
        // Starts a payment holiday
        Loan.prototype.startPaymentHoliday = function(months){
            this.paymentHoliday = months;
        };
        // Initializes the chart object
        Loan.prototype.initChart = function(){
            this.chart = {
                type: "ComboChart",
                displayed: false,
                data: [
                    ['Number', 'Interest', 'Principal', 'Balance'],
                ],
                options: {
                    isStacked: "true",
                    seriesType: 'area',
                    series: {
                        2: { 
                            type: 'line',      // "Balance" is a line chart
                            targetAxisIndex: 1 // ...with it's own axis
                        },
                    },
                    displayExactValues: true,
                    vAxes: {
                        0: {
                            minValue: 0,
                            maxValue: (this.basicPayment * 1.1),
                            gridlines: {
                                count: 6,
                                color: '#EEEEEE'
                            },
                        },
                        1: {
                            minValue: 0,
                            maxValue: this.amount,
                            gridlines: {
                                count: 5,
                                color: '#BBBBBB'
                            },
                        },
                    },
                    hAxis: {
                        gridlines: {
                            count: 10
                        },
                        format: 'decimal'
                    },
                    legend: { 'position': 'top' },
                    colors: ['#d9534f', '#337ab7', '#333333'],
                    lineWidth: 1,
                },
                formatters: {
                    number : [{
                        columnNum: 1,
                        pattern: "$ #,##0.00"
                    }]
                }
            };
            // Pre-populate with zeros
            this.num = 0;
            for(var p=0; p<=this.term; p++){
                this.chart.data.push([
                    p,
                    0,
                    0,
                    0,
                ]);
            }
        };
        // Adds a row to the chart
        Loan.prototype.addChartRow = function(payment){
            this.num ++; // Grab the next row
            this.chart.data[this.num] = [
                this.num, // Don't use a date Object; they're too expensive
                payment.interest,
                (payment.principal < 0 ? 0 : payment.principal), // When taking a payment holiday, the graph looks confusing when the principal is -ve
                payment.end_balance,
            ];
        };
        // Return the Loan object
        return Loan;
    }]);
})();