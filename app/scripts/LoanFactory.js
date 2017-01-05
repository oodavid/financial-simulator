'use strict';
/** LOAN - FACTORY
 *
 *      
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .factory('Loan', ['financeService', 'ledgerService', function(financeService, ledgerService){
        // Instantiation
        function Loan(props) {
            this.amount   = props.amount;
            this.apr      = props.apr;
            this.term     = props.term;
            this.start    = new Date();
            this.payments = [];
            // Calculate the lifetime payments
            this.lifetime();


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
            var l = this.payments.length;
            var start_balance = (l ? this.payments[l-1].end_balance : this.amount);
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
            this.payments.push({
                start_balance: start_balance,
                payment: payment,
                interest: interest,
                overpayment: overpayment,
                principal: principal,
                end_balance: end_balance,
            });
            // Add the changes to the ledger
            ledgerService.track({
                type: 'loan',
                name: 'An Unnamed Loan',
                value: (payment+overpayment),
                interest: interest
            });
        };
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
        // And return
        return Loan;
    }]);
})();