'use strict';
/** SALARY - FACTORY
 *
 *  Salaries earn a fixed income every month.
 *
 *      Properties
 *          loan.chart  -  Google Chart Data Object
 *          See init logic for others
 *
 *      Methods
 *          new Salary({ name, salary })  -  Initializes the loan
 *          salary.setAmount(salary)      -  Changes the value of the salary
 *
 *  TODO
 *
 *      Tax
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .factory('Salary', ['gameLoop', 'ledgerService', function(gameLoop, ledgerService){
        // Instantiation
        function Salary(props){
            var _this = this;
            // Basic settings
            this.name   = props.name;
            this.salary = props.salary;
            // The log and running totals
            this.payments    = [];
            this.lastPayment = null; // Pointer to the last payment object
            this.total = {
                gross: gross,           // Total amount paid
                take_home: (gross-tax), // ...of which we took home
                tax: tax,               // ...of which was tax
            };
            // Initialize the chart  
            this.initChart();
            // Get the paycheck on every tick
            var task = gameLoop.on('tick', function(){
                _this.getMonthlyPaycheck();
            });
        };
        // Adds a payment
        Loan.prototype.addPayment = function(gross, tax){
            var take_home = (gross-tax);
            // Add to our payments list
            this.lastPayment = {
                gross: gross,
                take_home: take_home,
                tax: tax,
            };
            this.payments.push(this.lastPayment);
            // Update our totals
            this.total.gross     += gross;
            this.total.take_home += take_home;
            this.total.tax       += tax;
            // Add the changes to the ledger
            ledgerService.track({
                type: 'salary',
                name: this.name,
                value: take_home,
                tax: tax
            });
            // Add to the chart
            this.addChartRow(this.lastPayment);
        };
        // Gets the monthly paycheck
        Salary.prototype.getMonthlyPaycheck = function(){
            // Calculate the gross income and tax
            var gross = this.salary / 12;
            var tax = 0;
            // Add the payment
            this.addPayment(gross, tax);
        };
        // Changes the salary
        Salary.prototype.setSalary = function(salary){
            this.salary = salary;
        };
        // Initializes the chart object
        Salary.prototype.initChart = function(){
            this.chart = {
                type: "AreaChart",
                displayed: false,
                data: [
                    ['Number', 'Tax', 'Take Home'],
                ],
                options: {
                    isStacked: "true",
                    displayExactValues: true,
                    vAxis: {
                        minValue: 0,
                        maxValue: (this.salary / 10),
                        gridlines: {
                            count: 6,
                            color: '#EEEEEE'
                        },
                    },
                    hAxis: {
                        gridlines: {
                            count: 10
                        },
                        format: 'decimal'
                    },
                    legend: { 'position': 'top' },
                    colors: ['#d9534f', '#337ab7'],
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
        Salary.prototype.addChartRow = function(payment){
            this.num ++; // Grab the next row
            this.chart.data[this.num] = [
                this.num, // Don't use a date Object; they're too expensive
                payment.tax,
                payment.take_home,
            ];
        };
        // Return the Salary object
        return Salary;
    }]);
})();