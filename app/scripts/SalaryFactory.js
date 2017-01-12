'use strict';
/** SALARY - FACTORY
 *
 *  Salaries earn a fixed income every month.
 *
 *      Properties
 *          See init logic for others
 *
 *      Methods
 *          new Salary({ name, salary })  -  Initializes the salary
 *          salary.setAmount(salary)      -  Changes the value of the salary
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .factory('Salary', ['gameLoop', 'ledgerService', function(gameLoop, ledgerService){
        // Instantiation
        function Salary(props){
            var _this = this;
            // The log and running totals
            this.payments = [];
            this.paycheck = null; // The most recent paycheck
            this.total = 0;
            // Basic settings
            this.name = props.name;
            this.setSalary(props.salary);
            // Get the paycheck on every tick
            var task = gameLoop.on('tick', function(){
                _this.applyMonthlyPaycheck();
            });
        };
        // Adds a paycheck
        Salary.prototype.addPaycheck = function(paycheck){
            console.log('addPaycheck');
            // Add to our payments list
            this.paycheck = paycheck;
            this.payments.push(this.paycheck);
            // Update our totals
            this.total += paycheck;
            // Add the changes to the ledger
            ledgerService.track('salary', this.name, paycheck);
        };
        // Applies a monthly paycheck
        Salary.prototype.applyMonthlyPaycheck = function(){
            console.log('applyMonthlyPaycheck');
            this.addPaycheck(this.paycheck);
        };
        // Changes the salary
        Salary.prototype.setSalary = function(salary){
            console.log('setSalary');
            this.salary   = salary;
            this.paycheck = salary / 12;
        };
        // Return the Salary object
        return Salary;
    }]);
})();