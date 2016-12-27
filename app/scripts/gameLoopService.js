'use strict';
/** GAME LOOP - SERVICE
 *
 *      The game loop "ticks" at given intervals, can be paused
 *       and can run at a number of different speeds.
 *
 *      @author   David 'oodavid' King
 */
angular.module('fateful')
.service('gameLoop', ['$timeout', '$filter', function($timeout, $filter){
    var _this = this;
    this.date       = null;  // Current Date (elapsed)
    this.dob        = null;  // Date of Birth
    this.age        = null;  // Current Age in Months
    this.retirement = null;  // Age of retirement in Months
    this.elapsed    = 0;     // Number of (months) that have elapsed
    this.remaining  = null;  // Number of (months) remaining
    this.speed      = 5000;  // ms between ticks
    this.timer      = false; // $timout object
    this.isPlaying  = false; // flag
    this.isPaused   = true;  // flag
    // The "current" date - used in our calculations
    this.date = new Date();
    this.date.setDate(1);
    this.date.setHours(12);
    this.date.setMinutes(0);
    this.date.setSeconds(0);
    // Calculates the age and remaining
    var recalculateDates = function(){
        // Age
        var monthsA = (_this.date.getYear()*12) + _this.date.getMonth();
        var monthsB = (_this.dob.getYear()*12)  + _this.dob.getMonth();
        _this.age = monthsA - monthsB;
        // Remaining
        _this.remaining = _this.retirement - _this.age;
    };
    // Sets the date of birth
    this.setDob = function(date){
        _this.dob = date;
        recalculateDates();
    };
    // ...from an age
    this.setDobFromAge = function(years, months){
        var dob = new Date();
        dob.setYear(dob.getYear()-years);
        dob.setMonth(dob.getMonth()-months);
        _this.setDob(dob);
    };
    // Sets retirement age
    this.setRetirementAge = function(years, months){
        _this.retirement = (years*12) + months;
        recalculateDates();
    };
    // Sensible defaults
    this.setDobFromAge(30, 0);
    this.setRetirementAge(65, 0);
    // Tick method
    this.tick = function(){
        _this.elapsed ++;
        _this.date.setMonth(_this.date.getMonth()+1);
        recalculateDates();
        _this.timer = $timeout(_this.tick, _this.speed); // Tick!
    };
    this.setSpeed = function(milliseconds){
        this.speed = milliseconds;
        if(this.isPlaying){
            this.pause();
            this.play();
        }
    };
    this.play = function(){
        if(this.isPaused){
            this.isPaused  = false;
            this.isPlaying = true;
            this.timer = $timeout(this.tick, this.speed); // Tick!
        }
    };
    this.pause = function(){
        if(this.isPlaying){
            this.isPaused  = true;
            this.isPlaying = false;
            $timeout.cancel(this.timer); // Cancel the timer
        }
    };
}]);