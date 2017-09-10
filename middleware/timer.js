var Timer = function(){
    this.timers = {};

    this.getChangedDate = function(){
        return Date.now() + 2000;
    };

    this.getDateTimer = function(key){
        let timer = this.timers[key];
        let check = Date.now() > timer;
        if(check){
            delete this.timers[key];
            return true;
        }
        return check;
    };

    this.setDateTimer = function(key){
        this.timers[key] = this.getChangedDate();
        return this.timers[key];
    };

    this.getTimer = function(key){
        return this.timers[key];
    };

    this.removeTimer = function(key){
      delete this.timers[key];
    };

    this.startTimer = function(key, time, cb){
        let self = this;
        if(key in this.timers) return;
        else{
            this.timers[key] = time;
        }
        let timer = setInterval(function () {
            self.timers[key]--;
            if(self.timers[key] === 1){
                cb();
                delete self.timers[key];
                clearInterval(timer);
            }
        }, 1000);
    };
};

module.exports = Timer;