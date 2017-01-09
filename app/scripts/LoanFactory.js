'use strict';
/** LOAN - FACTORY
 *
 *      
 *
 *      @author   David 'oodavid' King
 */
console.log('TODO > Loan > Sort out the chart');
console.log('TODO > Loan > Payday Loans don\'t use APR, should we cater for them?');
(function(){
    angular.module('fateful')
    .factory('Loan', ['gameLoop', 'financeService', 'ledgerService', 'emitterService', function(gameLoop, financeService, ledgerService, emitterService){
        // Instantiation
        function Loan(props){
            var _this = this;
            this.name        = props.name;
            this.amount      = props.amount;
            this.apr         = props.apr;
            this.term        = props.term;
            this.start       = new Date(gameLoop.date);
            this.payments    = [];
            this.lastPayment = null; // Pointer to the last payment object
            this.overpayment = 0; // Recurring overpayment amount
            // 
            this.basicPayment = -financeService.PMT(this.apr/12, this.term, this.amount);
            this.total = {
                payment: 0,
                principal: 0,
                interest: 0,
            };
            //
            // Event Emitter
            //
            emitterService.addLogicTo(this);
            //
            // Chart - WIP
            //
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
                        2: { type: 'line', targetAxisIndex: 1 }, // "Balance" is a line chart, with it's own axis
                    },
                    displayExactValues: true,
                    vAxis: {
                        gridlines: {
                            count: 10
                        }
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
            // Pre-fill the data with columns
            this.num = 0;
            for(var p=0; p<this.term; p++){
                this.chart.data.push([
                    p,
                    0,
                    0,
                    0,
                ]);
            }

            //
            // Tick - make a payment
            //
            var task = gameLoop.on('tick', function(){
                _this.makeMonthlyPayment();
                if(_this.lastPayment.end_balance <= 0){
                    gameLoop.off(task);
                    _this.trigger('paid');
                }
            });
            // Make the first payment
            // _this.makeMonthlyPayment();
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
            this.num ++;
            this.chart.data[this.num] = [
                this.num, // new Date(gameLoop.date),
                this.lastPayment.interest,
                this.lastPayment.principal,
                this.lastPayment.end_balance,
            ];
        };
        // Calculates monthly interest, and makes a payment
        Loan.prototype.makeMonthlyPayment = function(){
            // Calculate the interest, payment and overpayment
            var start_balance = this.lastPayment ? this.lastPayment.end_balance : this.amount;
            var interest = start_balance * (this.apr/12);
            var payment = -financeService.PMT(this.apr/12, this.term, this.amount);
            var overpayment = this.overpayment;
            // Add the payment
            this.addPayment(interest, payment, overpayment);
        };
        // Sets a regular overpayment amount, applied during makeMonthlyPayment
        Loan.prototype.setRecurringOverpayment = function(overpayment){
            this.overpayment = overpayment;
        };
        // Makes an overpayment, doesn't calculate monthly interest
        Loan.prototype.makeOverpayment = function(overpayment){
            // Add the overpayment
            this.addPayment(0, 0, overpayment);
        };
        // And return
        return Loan;
    }]);
})();