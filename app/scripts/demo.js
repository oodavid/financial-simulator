'use strict';
/** DEMO
 *
 *      Our app and it's module dependencies
 *
 *      @author   David 'oodavid' King
 */
angular.module('fateful')
.controller("DemoCtrl", ['$scope', 'financeFactory', function ($scope, financeFactory) {

  $scope.liabilities = [
    { name: 'house',   value: '240000', loan: { type: 'interest-only', interest: 3, term: 300 } }, // 25 years * 12 months
    { name: 'car',     value:  '12000', loan: { type: 'repayment',     interest: 5, term: 12 } },
    { name: 'holiday', value:   '4000', loan: { type: 'repayment',     interest: 4, term: 24 } },
    { name: 'wedding', value:  '30000', loan: { type: 'repayment',     interest: 4, term: 24 } },
  ];
  // Income & Assets 
  $scope.assets = [
    { name: 'salary', value: '1200' }
  ];
  //
  // Loan / Amortization example
  //
  $scope.loan = {
    amount: 100000,
    apr: 0.045,
    term: 300,
    start: new Date(),
    payments: []
  };
  $scope.addRow = function(loan, overpayment){
    var l = loan.payments.length;
    var start_balance = (l ? loan.payments[l-1].end_balance : loan.amount);
    var interest = start_balance * (loan.apr/12);
    var payment = -financeFactory.PMT(loan.apr/12, loan.term, loan.amount);
    var overpayment = overpayment || 0;
    var principal = payment + overpayment - interest;
    var end_balance = start_balance - principal;
    loan.payments.push({
      start_balance: start_balance,
      payment: payment,
      interest: interest,
      overpayment: overpayment,
      principal: principal,
      end_balance: end_balance,
    });
  };
  // Add a bunch of rows
  for(var i=0; i<10; i++){
    $scope.addRow($scope.loan);
  }

  
  // https://support.google.com/docs/answer/3093185
  //   Payment on a 145,000 loan at 5% over 25 years
  $scope.PMT = financeFactory.PMT;
  var pmt = financeFactory.PMT((0.025/12), 24, 6000);
  console.log(pmt); // expect  -256.5623533
  // https://support.google.com/docs/answer/3093224
  var fv = financeFactory.FV(0.03, 5, -500, -7000);
  console.log(fv); // expect  10769.48643
  // https://support.google.com/docs/answer/3093175
  var ipmt = financeFactory.IPMT((0.025/12), 1, (60*5), 30000);
  console.log(ipmt); // expect  -62.5
  // https://support.google.com/docs/answer/3093187
  var ppmt = financeFactory.PPMT((0.075/12), 3, 24, 5000, 0, 1);
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
.controller("LineCtrl", ['$scope', function ($scope) {

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
}])

.controller("RadarCtrl", function ($scope) {
  $scope.labels =["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"];

  $scope.data = [
    [65, 59, 90, 81, 56, 55, 40],
    [28, 48, 40, 19, 96, 27, 100]
  ];
});