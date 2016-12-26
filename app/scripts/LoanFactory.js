'use strict';
/** LOAN - FACTORY
 *
 *      
 *
 *      @author   David 'oodavid' King
 */
angular.module('fateful')
.factory('Loan', ['financeService', function(financeService){
    // Instantiation
    function Loan(props) {
        this.amount   = props.amount;
        this.apr      = props.apr;
        this.term     = props.term;
        this.start    = new Date();
        this.payments = [];


        // Add a bunch of rows
        for(var i=0; i<10; i++){
            this.addRow();
        }


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
        var interest = start_balance * (this.apr/12);
        var payment = -financeService.PMT(this.apr/12, this.term, this.amount);
        var overpayment = overpayment || 0;
        var principal = payment + overpayment - interest;
        var end_balance = start_balance - principal;
        this.payments.push({
            start_balance: start_balance,
            payment: payment,
            interest: interest,
            overpayment: overpayment,
            principal: principal,
            end_balance: end_balance,
        });
    };
    // And return
    return Loan;
}]);