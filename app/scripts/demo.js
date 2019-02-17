'use strict';
/** DEMO
 *
 *      Our app and it's module dependencies
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .controller("DemoCtrl", ['$scope', 'gameLoop', 'Loan', 'Salary', 'financeService', 'ledgerService', function ($scope, gameLoop, Loan, Salary, financeService, ledgerService){




        //
        // Outgoings
        //
        $scope.myChart = {
            type: "PieChart",
            data: [
                ['Outgoing', 'Value'],
                ['House',    650],
                ['Car',      300],
                ['Holiday',  4000/12],
                ['Savings',  200]
            ],
            options: {
                pieHole: 0.2,
                pieSliceText: 'label',
                legend: 'none',
               'chartArea': {'width': '100%', 'height': '80%'},
            }
        };
        $scope.liabilities = [
            { name: 'house',   value: '240000', loan: { type: 'interest-only', interest: 3, term: 240 } }, // 20 years * 12 months
            { name: 'car',     value:  '12000', loan: { type: 'repayment',     interest: 5, term: 12 } },
            { name: 'holiday', value:   '4000', loan: { type: 'repayment',     interest: 4, term: 24 } },
            { name: 'wedding', value:  '30000', loan: { type: 'repayment',     interest: 4, term: 24 } },
            { name: 'baby a',  value:    '300', loan: { type: 'repayment',     interest: 4, term: 24 } },
        ];
        $scope.addHome = function(){

        };
        $scope.addCar = function(){

        };
        $scope.addHoliday = function(){

        };







        // Income & Assets 
        $scope.assets = [
            { name: 'salary', value: '1200' }
        ];
        // Hoist the GameLoop and Ledger
        $scope.loop = gameLoop;
        $scope.ledger = ledgerService;
        // Helper method to get the progress
        $scope.getProgress = function(){
            return 100 * gameLoop.elapsed / (gameLoop.elapsed + gameLoop.remaining) + '%';
        };
        // Create a demo Loan object
        $scope.loan = new Loan({
            name: 'My Mortgage',
            amount: 100000,
            apr:    0.045,
            term:   240,
        });
        $scope.loan.on('paid', function(){
            gameLoop.pause();
            console.log(this.name + ' paid off.\n\nI paused the game for you.');
        });
        // Create a demo Salary object
        $scope.salary = new Salary({
            name:   'My Job',
            salary: 18000,
        });
        //
        // Test the gameLoop events
        //
        gameLoop.one('gameStart', function(){
            console.log('game has started');
        });
        gameLoop.one('gameEnd', function(){
            console.log('game has ended');
        });
        gameLoop.one('tick', function(){
            console.log('ONE tick');
        });
        gameLoop.on('tick', function(){
            console.log('on tick');
        });
        var task = gameLoop.on('tick', function(){
            console.log('one tick (manually removed)');
            gameLoop.off(task);
        });
        //
        // Test the financeService logic
        //
        // https://support.google.com/docs/answer/3093185
        $scope.PMT = financeService.PMT;
        var pmt = financeService.PMT((0.025/12), 24, 6000);
        console.log(pmt); // expect  -256.5623533
        // https://support.google.com/docs/answer/3093224
        var fv = financeService.FV(0.03, 5, -500, -7000);
        console.log(fv); // expect  10769.48643
        // https://support.google.com/docs/answer/3093175
        var ipmt = financeService.IPMT((0.025/12), 1, (60*5), 30000);
        console.log(ipmt); // expect  -62.5
        // https://support.google.com/docs/answer/3093187
        var ppmt = financeService.PPMT((0.075/12), 3, 24, 5000, 0, 1);
        console.log(ppmt); // expect  -194.958888


        /*
        purchase
            cash
            loan
        invest
            one-off
            recurring
        overpay
            one-off
            recurring
        job (special case)
            income
            16,000 / year
            paid monthly
            events
                payrise in 5 years
                payrise in 10 years
                payrise in 15 years
                payrise in 20 years
                payrise in 25 years
        */

    }])


    .controller("ChartCtrl", ['$scope', '$interval', function($scope, $interval){
        /*
        $scope.chart = {
            type: "LineChart",
            data: [
                ['Component', 'cost']
            ],
            options: {
                displayExactValues: true,
            },
            formatters: {
                number : [{
                    columnNum: 1,
                    pattern: "$ #,##0.00"
                }]
            }
        };

        var last = 0;
        var n = 0;
        $scope.addData = function(){
            n++;
            if(n < 300){
                $scope.chart.data.push(['Test', Math.random()*100000]);
                var now = Date.now()
                console.log(n, now-last);
                last = now;
            }
        };
        $interval($scope.addData, 50);
        */
    }])

    .controller("LineCtrl", ['$scope', function ($scope) {
        /*
        $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.series = ['Series A', 'Series B'];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        $scope.options = {
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
        */
    }])

    .controller("RadarCtrl", function ($scope) {
        /*
        $scope.labels =["Low Risk", "Medium Risk", "High Risk", "Gold", "Property"];
        $scope.data = [
            [65, 59, 90, 81, 56],
            [28, 48, 40, 19, 96]
        ];
        */
    });

})();