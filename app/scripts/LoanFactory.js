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
            this.start       = new Date();
            this.payments    = [];
            this.lastPayment = null; // Pointer to the last payment object
            this.overpayment = 0;
            //
            // Event Emitter
            //
            emitterService.addLogicTo(this);
            //
            // Tick - make a payment
            //
            console.log('this doesn\'t feel clean enough...');
            _this.makeMonthlyPayment(); // Make the first payment ASAP
            var task = gameLoop.on('tick', function(){
                _this.makeMonthlyPayment();
                if(_this.lastPayment.end_balance <= 0){
                    gameLoop.off(task);
                    _this.trigger('paid');
                }
            });
            //
            // Chart - WIP
            //
            this.chart = {};
            this.chart.labels = ["January", "February", "March", "April", "May", "June", "July"];
            this.chart.series = ['Series A', 'Series B'];
            this.chart.data = [
                [65, 59, 80, 81, 56, 55, 40],
                [28, 48, 40, 19, 86, 27, 90]
            ];
            this.chart.onClick = function (points, evt) {
                console.log(points, evt);
            };
            this.chart.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
            this.chart.options = {
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left'
                        },
                        {
                            id: 'y-axis-2',
                            type: 'linear',
                            display: true,
                            position: 'right'
                        }
                    ]
                }
            };
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
            // Add the changes to the ledger
            ledgerService.track({
                type: 'loan',
                name: this.name,
                value: (payment+overpayment),
                interest: interest
            });
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