'use strict';
/** LOAN - FACTORY
 *
 *      
 *
 *      @author   David 'oodavid' King
 */
console.log('TODO > Loan > Create "makeOneOffPayment" method');
console.log('TODO > Loan > Create "setRecurring" method');
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
            //
            // Event Emitter
            //
            emitterService.addLogicTo(this);

            // Add a row on tick
            console.log('this doesn\'t feel clean enough...');
            var task = gameLoop.on('tick', function(){
                _this.addRow();
                if(_this.lastPayment.end_balance <= 0){
                    gameLoop.off(task);
                    _this.trigger('paid');
                }
            });


            // Calculate the lifetime payments
            // this.lifetime();


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
        // Adds a row to the payments list
        Loan.prototype.addRow = function(overpayment){
            var start_balance = this.lastPayment ? this.lastPayment.end_balance : this.amount;
            if(start_balance <= 0){
                return; // No need for an extra row, we're done
            }
            var interest = start_balance * (this.apr/12);
            var payment = -financeService.PMT(this.apr/12, this.term, this.amount);
            var overpayment = overpayment || 0;
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
            }
            this.payments.push(this.lastPayment);
            // Add the changes to the ledger
            ledgerService.track({
                type: 'loan',
                name: this.name,
                value: (payment+overpayment),
                interest: interest
            });
        };
        /*
        // Adds a row to the payments list
        Loan.prototype.lifetime = function(overpayment){
            for(var i=0; i<this.term; i++){
                this.addRow(100);
                var l = this.payments.length;
                if(this.payments[l-1].end_balance <= 0){
                    break;
                }
            }
        };
        */
        // And return
        return Loan;
    }]);
})();