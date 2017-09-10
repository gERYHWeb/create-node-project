Array.prototype.inArray = function(p_val) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] == p_val) {
            return true;
        }
    }
    return false;
};

if (!window.setImmediate) var setImmediate = (function() {
    var head = { }, tail = head; // очередь вызовов, 1-связный список

    var ID = Math.random(); // уникальный идентификатор

    function onmessage(e) {
        if(e.data != ID) return; // не наше сообщение
        head = head.next;
        var func = head.func;
        delete head.func;
        func();
    }

    if(window.addEventListener) { // IE9+, другие браузеры
        window.addEventListener('message', onmessage);
    } else { // IE8
        window.attachEvent( 'onmessage', onmessage );
    }

    return function(func) {
        tail = tail.next = { func: func };
        window.postMessage(ID, "*");
    };
}());

var hash = {
    // Получаем данные из адреса
    get: function() {
        var vars = {},
            hash, splitter, hashes;
        if (!this.oldbrowser()) {
            var pos = window.location.href.indexOf('?');
            hashes = (pos != -1) ? decodeURIComponent(window.location.href.substr(pos + 1)) : '';
            splitter = '&';
        } else {
            hashes = decodeURIComponent(window.location.hash.substr(1));
            splitter = '/';
        }

        if (hashes.length == 0) {
            return vars;
        } else {
            hashes = hashes.split(splitter);
        }

        var k = 0;
        for (var i in hashes) {
            if (hashes.hasOwnProperty(i)) {
                hash = hashes[i].split('=');
                if (typeof hash[1] == 'undefined') {
                    vars['anchor'] = hash[0];
                } else {
                    if (hash[0].match(/\[\]$/)) {
                        hash[0] = hash[0].replace(/\[\]$/, "[" + k + "]");
                    }
                    vars[hash[0]] = hash[1];
                }
            }
            k++;
        }
        return vars;
    }
    // Вытягиваем хэш строку
    ,
    getHash: function(value){
        var h = location.hash;
        if(!h) return false;
        h = h.replace(/^\#/, "");
        if(h.match(/\&/)){
            h = hash.split("&", h);
        }else{
            h = [
                h
            ];
        }
        var hashes = {};
        for(var key in h){
            var val = h[key];
            if(typeof val === "function") continue;
            val = val.split("=");
            hashes[val[0]] = val[1];
        }
        if(!value)
            return hashes;
        else return hashes[value];
    }
    // Заменяем данные в адресе на полученный массив
    ,
    set: function(vars) {
        var hash = '';
        for (var i in vars) {
            if (vars.hasOwnProperty(i)) {
                hash += '&' + i + '=' + vars[i];
            }
        }

        if (!this.oldbrowser()) {
            if (hash.length != 0) {
                hash = '?' + hash.substr(1);
            }
            window.history.pushState(hash, '', document.location.pathname + hash);
        } else {
            window.location.hash = hash.substr(1);
        }
    }
    // Добавляем одно значение в адрес
    ,
    add: function(key, val) {
        var hash = this.get();
        hash[key] = val;
        this.set(hash);
    }
    // Удаляем одно значение из адреса
    ,
    remove: function(key) {
        var hash = this.get();
        delete hash[key];
        this.set(hash);
    }
    // Очищаем все значения в адресе
    ,
    clear: function() {
        this.set({});
    }
    // Проверка на поддержку history api браузером
    ,
    oldbrowser: function() {
        return !(window.history && history.pushState);
    }
};

var Valid = {
    username: function(v){
        return this.stdName(v, 3, 151, "invalid_username");
    },
    firstName: function(v){
        var error = null;
        if(v.toString().length > 0){
            if(typeof v !== "string" || !v.match(/^[а-яёЁА-Яa-zA-Z\d\-\_]*$/)){
                error = "invalid_firstname";
            }
        }
        return error;
    },
    lastName: function(v){
        var error = null;
        if(v.toString().length > 0) {
            if (typeof v !== "string" || !v || !v.match(/^[а-яёЁА-Яa-zA-Z\d\-\_]*$/)) {
                error = "invalid_lastname";
            }
        }
        return error;
    },
    roomName: function(v){
        return this.stdName(v, 3, 150, "invalid_roomname");
    },
    timeRound: function(v){
        return this.stdNumber(v, 3, 150, "invalid_timeround");
    },
    minBet: function(v){
        return this.stdNumber(v, 10, 1000000, "invalid_minbet");
    },
    password: function(v){
        return (v) ? false : "invalid_password";
    },
    confirmPassword: function(v, v2){
        return (v === v2) ? false : "invalid_confirm_password";
    },
    phone: function(v){
        var error = null;
        if(v.toString().length > 0){
            if (typeof v !== "string" || !v || !v.match(/^(\+)?\d{2}(\()?\d{3}(\))?\d{3}(-)?\d{2}(-)?\d{2}$/)) {
                error = "invalid_phone";
            }
        }
        return error;
    },
    email: function(v){
        var error = null;
        if (!v.match(/^([a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*\.[a-zA-Z]{2,6}$/)) {
            error = "invalid_email";
        }
        return error;
    },
    balance: function(v){
        var error = null;
        if (!v.match(/^[0-9]*$/)) {
            error = "invalid_balance";
        }else if(!v.match(/^[0-9]{1,10}$/)){
            error = "too_much_balance";
        }
        return error;
    },
    wallet: function(v, min, max){
        let msg = "invalid_wallet";
        if(min === max){
            var error = null;
            if(!v || !v.match(/^\d*$/))
                error = msg;
            v = parseInt(v);
            if(isNaN(v)){
                error = msg;
            }
            return error;
        }else{
            return this.stdNumber(v, min, max, msg);
        }

    },
    amount: function(v, min, max){
        return this.stdNumber(v, min, max, "invalid_amount");
    },
    stdName: function(v, min, max, msg){
        var error = null;
        if(typeof v !== "string" || !v || !v.match(/^[а-яёЁА-Яa-zA-Z\d\-\_]*$/)){
            error = msg;
        }else if(v.length < min){
            error = msg + "_min";
        }else if(v.length > max){
            error = msg + "_max";
        }
        return error;
    },
    stdNumber: function(v, min, max, msg){
        var error = null;
        if(!v || !v.match(/^\d*$/))
            error = msg;
        v = parseInt(v);
        if(isNaN(v)){
            error = msg;
        }else if(v < min){
            error = msg + "_min";
        }else if(v > max){
            error = msg + "_max";
        }
        return error;
    }
};

var socket = io();
var startSendData = true;

var Chat = function(json) {
    var self = this;

    this.init = function() {
        var mainEl = $("<div />");
        var el;
        for (var i = 0; i < json.length; i++) {
            el = self.addItem(json[i]);
            mainEl.prepend(el);
            el = null;
        }
        return mainEl;
    };

    this.addItem = function(item) {
        var tmpl = $("#chatItemTmpl").html();
        tmpl = _.template(tmpl);
        return tmpl(item);
    };

};

var HEADER_MESSAGE = function(options){
    var self = this;
    self.timeDelay = 5000;
    self.timeDelayScroll = 700;
    self.offsetTop = 0;
    self.formMsg = false;
    self.consts = {
        "classes": {
            "activeMsg": "hdMsg--active",
            "wrap": "hdMsg__wrap",
            "msg": "hdMsg__msg",
            "bgSymb": "hdMsg__bgSymb",
            "symb": "hdMsg__symb",
            "showSymb": "hdMsg__symb--show"
        }
    };
    self.typeOfParams = {
        "error": {
            "icon": "glyphicon glyphicon-ban-circle",
            "class": "hdMsg--error"
        },
        "winner": {
            "icon": "glyphicon glyphicon-gift",
            "class": "hdMsg--winner"
        },
        "success": {
            "icon": "glyphicon glyphicon-ok-circle",
            "class": "hdMsg--success"
        }
    };
    for(var key in options){
        self[key] = options[key];
    }
    self.consts.classes.activeMsg = ( (self.formMsg) ? "hdMsg--activeForm" : "hdMsg--active" );

    this.viewMessage = function(){
        var self = this;
        var cl = self.consts.classes;
        self.$el.attr("class", "hdMsg");
        if(self.$el.hasClass(cl.activeMsg)){
            self.$el.removeClass(cl.activeMsg);
            setTimeout(function(){
                self.setMessage();
                self.$el.addClass(cl.activeMsg);
            }, 700);
        }else{
            self.setMessage();
            self.$el.addClass(cl.activeMsg);
        }
        setImmediate(function(){
            // $('body, html').animate({
            //     "scrollTop" : self.offsetTop + "px"
            // }, self.timeDelayScroll, function(){
            // });
            setTimeout(function(){
                self.$el.removeClass(cl.activeMsg);
                // setTimeout(function(){
                // 	self.cleanMessage();
                // }, 2000);
            }, self.timeDelay);
        });
    };

    this.setMessage = function(){
        var self = this;
        var cl = self.consts.classes;
        var type = self.typeOfParams[self.type];
        if(type == "undefined"){
            self.$el.find('.' + cl.msg).text(self.text);
            self.$el.find('.' + cl.symb).attr("class", cl.symb);
        }else{
            self.$el.find('.' + cl.msg).text(self.text);
            self.$el.find('.' + cl.symb).attr("class", cl.symb + " " + cl.showSymb + " " + type.icon);
            self.$el.addClass(type.class);
        }
    };

    this.cleanMessage = function(){
        var self = this;
        var cl = self.consts.classes;
        self.$el.find('.' + cl.msg).text("");
        self.$el.find('.' + cl.symb).attr("class", "hdMsg__symb");
    };

    this.close = function(){
        var self = this;
        var cl = self.consts.classes;
        self.$el.removeClass(cl.activeMsg);
    };

    this.open = function(){
        var self = this;
        var cl = self.consts.classes;
        self.$el.addClass(cl.activeMsg);
    };
};

// Структуризация плагинов jQuery
var Plugins = {

  // With Fn jQuery
  w_fn: {},

  // WithOut Fn jQuery
  wOut_fn: {},

  // Check object on empty
  isEmptyObj: function(obj){
    var count = 0;
    for(var key in obj){
      count++;
    } 
    return count;
  }, 

  // Run plugins
  start: function(){
    var wOut_fn = this.wOut_fn;
    if(this.isEmptyObj(wOut_fn)){
      for(namePlugin in wOut_fn){
        !(function($){
          $[namePlugin] = wOut_fn[namePlugin];
        })(jQuery);
      }
    }
    var w_fn = this.w_fn;
    if(this.isEmptyObj(w_fn)){
      for(namePlugin in w_fn){
        !(function($){
          $.fn[namePlugin] = w_fn[namePlugin];
        })(jQuery);
      }
    }
  }
};

Plugins.w_fn.transformImg = function(){
    var $module = $(this);
    new TransformImg($module);
    return $module;
};

Plugins.w_fn.getConfig = function(selector){
  var $module = $(this);
  var config = {};
  if(!selector){
    config = $module.find('[type="text/x-config"]');
  }else{
    config = $module.find(selector);
  }
  try{
    config = config.html();
    var json = JSON.parse(config);
    var msgs = json.msgs;
    json.getMsg = function(text){
        var value = text;
        for(var key in msgs){
            var val = msgs[key];
            var number;
            if(key == text){
                value = val;
            }else if(text.match(new RegExp("^" + key))){
                number = text.replace(/.*\_(\d*)$/, "$1");
                value = val.replace(/\#1/, number);
            }
        }
        return value;
    };
    return json;
  }catch(e){
    return console.error("Incorrect JSON to config!");
  }
};

Plugins.w_fn.renderChat = function(type, options) {
    options = $.extend({
        json: {}
    }, options);

    return this.each(function() {
        $this = $(this);

        var chat = new Chat(options.json);
        var msgs = chat.init();
        if (type === "init") {
            $this.html(msgs.html());
        } else if (type === "append") {
            $this.append(msgs.html());
        }
    });
};

Plugins.w_fn.headerMessage = function(options){

    options = $.extend({
        text: "Fatal error!",
        type: "error"
    }, options);

    var $this = $(this);
    options.$el = $this;
    return new HEADER_MESSAGE(options);

};