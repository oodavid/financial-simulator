'use strict';
/** GAME LOOP - SERVICE
 *
 *      The game loop "ticks" at given intervals, can be paused
 *       and can run at a number of different speeds.
 *
 *      The loop can be subscribed to, it fires a number of events:
 *          gameStart
 *          tick
 *          gameEnd
 *
 *      To subscribe and unsubscribe, use:
 *          var task = gameLoop.on('tick', callback);
 *          gameLoop.off(task);
 *
 *      Alternatively, you can use the `one` method:
 *          gameLoop.one('tick', callback);
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .service('gameLoop', ['$interval', '$filter', 'emitterService', function($interval, $filter, emitterService){
        var _this = this;
        //
        // Event Emitter
        //
        emitterService.addLogicTo(this);
        //
        // Date tracking
        //
        this.date = new Date(); // Current Date (elapsed)
        this.date.setDate(1);
        this.date.setHours(12);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        this.dob        = null;  // Date of Birth
        this.age        = null;  // Current Age in Months
        this.retirement = null;  // Number of months till retirement
        this.elapsed    = 0;     // Number of months that have elapsed
        this.remaining  = null;  // Number of months remaining
        this.speed      = 1000;  // ms between ticks
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
        this.setDobFromAge(25, 0);
        this.setRetirementAge(65, 0);
        //
        // Tick methods
        //
        this.isPlaying = false; // flag
        this.isPaused  = true;  // flag
        var interval   = false;  // So we can cancel the tick
        var hasStarted = false;  // flag
        var hasEnded   = false;  // flag
        var doTick = function(){
            if(!hasEnded){
                _this.elapsed ++;
                _this.date.setMonth(_this.date.getMonth()+1);
                recalculateDates();
                if(!hasStarted){
                    hasStarted = true;
                    _this.trigger('gameStart'); // Must only trigger once
                }
                _this.trigger('tick');
                if(_this.remaining <= 0){
                    _this.trigger('gameEnd'); // Must only trigger once
                    _this.pause();
                }
            }
        };
        this.tick = function(){
            _this.pause();
            doTick();
        };
        this.setSpeed = function(milliseconds){
            _this.speed = milliseconds;
            if(_this.isPlaying){
                _this.pause();
                _this.play();
            }
        };
        this.play = function(){
            if(!hasEnded && _this.isPaused){
                _this.isPaused  = false;
                _this.isPlaying = true;
                interval = $interval(doTick, _this.speed);
            }
        };
        this.pause = function(){
            if(_this.isPlaying){
                _this.isPaused  = true;
                _this.isPlaying = false;
                $interval.cancel(interval);
            }
        };
    }]);
})();