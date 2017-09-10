'use strict';
var sha224 = require('js-sha256').sha224;
var Random = require('random-js');

module.exports = function(){
    var random = new Random();
    this.roundNumber = function(){
        return random.real(0,1) + "+" + this.randomString(10, 15);
    };

    this.parseRN = function(str){
          return str.replace(/^(0\.[0-9]*).*/, "$1");
    };

    this.roundHash = function(str){
        return sha224(str);
    };

    this.randomInt = function(min, max){
        return random.integer(min, max);
    };

    this.randomString = function(min, max){
        if(!max) max = min;
        var self = this;
        return random.string(self.randomInt(min, max), "_qwertyuiopasdfghjklzxcvbnm_QWERTYUIOPASDFGHJKLZXCVBNM_0123456789_0123456789");
    };
};