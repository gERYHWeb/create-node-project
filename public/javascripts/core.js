'use strict';
var transformAvatar = function(){
    var $this = $('.isAvatar');
    $this.each(function(){
        var $self = $(this);
        $self.transformImg();
        setImmediate(function(){
            $self.transformImg();
        });
    });
};

var preloader = function () {
    var $pl  = $('#preloader');
    $pl.toggleClass('isActive');
};

var TransformImg = function($uAvatarImg) {
    var $uAvatar = $uAvatarImg.parent();
    var block = {
        w: $uAvatar.width(),
        h: $uAvatar.height()
    };

    var img = {
        w: $uAvatarImg.width(),
        h: $uAvatarImg.height()
    };

    var css = {};

    if(img.w < img.h) {
        $uAvatarImg.attr("style", "");
        css.marginTop = (block.h - img.h) / 2;
        css.width = "100%";
        css.height = "auto";
    }else{
        $uAvatarImg.attr("style", "");
        css.marginLeft = (block.w - img.w) / 2;
        css.width = "auto";
        css.height = "100%";
    }
    $uAvatarImg.css(css);
};

var ViewMessage = function(msg, type){
    var $hdMsg = $('[data-module="headerMessage"]');
    $hdMsg.headerMessage({
        text: config.getMsg(msg),
        type: type,
        timeDelay: 3500
    }).viewMessage();
};

var ViewMessageFromData = function($this, data){
    var $hdMsg = $('[data-module="headerMessage"]');
    if(typeof data === "object") {
        if ("error" in data) {
            if(typeof data.error === "object") {
                var key, val, $el;
                for(key in data.error){
                    val = data.error[key];
                }
                $el = $this.find('.js-validation[data-type="' + key + '"], .js-vn[data-type="' + key + '"]');
                $el.addClass('isNotValid');
                $hdMsg.headerMessage({
                    text: config.getMsg(val),
                    type: "error"
                }).viewMessage();
            }else{
                $hdMsg.headerMessage({
                    text: config.getMsg(data.error),
                    type: "error"
                }).viewMessage();
            }
        } else if ("msg" in data) {
            var msg = data.msg;
            if (msg === "reload") {
                setImmediate(function () {
                    location.reload();
                });
                return;
            } else if (msg === "redirect") {
                location.replace(data.redirect);
                return;
            }else if(typeof msg === "object"){
                msg = msg.success;
                if("img" in data.msg){
                    if($($this.data('imgsef'))[0])
                        $($this.data('imgsef')).attr('src', data.msg.img);
                    else location.reload();
                }
            }
            $hdMsg.headerMessage({
                text: config.getMsg(msg),
                type: "success"
            }).viewMessage();
        }else{
            return data;
        }
    }
    return;
};

var WebSocketController = function() {
    var self = this;
    // this.roomID = getCookie("roomID") || $("#roomID").val();
    // this.ip = getCookie("ip") || $("#IP").val();
    this.roomID = 1;
    this.token = 1;
    this.data = {};
};

WebSocketController.prototype = {
    viewAll: function(){
        if(!startSendData) return;
        startSendData = false;
        var self = this;

        socket.emit('connection', JSON.stringify({
            type: 'viewAll',
            room: self.roomID,
            token: self.token
        }));
        socket.on('viewAll', function(obj){
            self.data = obj;
            self.routerData();
            self.init();
            setImmediate(function() {
                startSendData = true;
            });
        });
        socket.on('error', function(data){
            ViewMessage(data.error, "error");
            setImmediate(function() {
                startSendData = true;
            });
        });
    },
    init: function(){
        var self = this;

        socket.on('globalStats', function(obj){
            self.data = obj;
            self.routerData();
            setImmediate(function() {
                startSendData = true;
            });
        });
    },
    routerData: function(){
        var self = this;
        var data = this.data;
        
        this.startEvent();
    },
    startEvent: function(){
        var $body = $("body");
        $body.on("click", ".js-makeBet", function(){
            var $this = $(this);
            var $betArea = $($this.data('betarea'));
            var bet = $betArea.val();
        });
    }
};

var Core = function() {
    var $body = $('body');

    var runGlobalScripts = function() {
        _.templateSettings = {
            interpolate: /\{\{(.+?)\}\}/g
        };
        startSendData = true;
        window.WS = new WebSocketController();
        setImmediate(function(){
            WS.viewAll();
        });
    };

    // Delayed Animations
    var runSidebars = function() {

    };

    var runFormEvents = function(){
        $body.on('keyup keydown', '.js-validation, .js-vn', function(){
            var $this = $(this);
            $this.removeClass('isNotValid');
        });


        $body.on('submit', '#LoginForm', function(e){
            e.preventDefault();
            var $this = $(this);
            var $username = $this.find('.js-vn[data-type=username]');
            var $email = $this.find('.js-vn[data-type=email]');
            var $password = $this.find('.js-vn[data-type=password]');
            var data = { error: {} };

            if($username[0]){
                var errorUsername = validation.username($username.val());
                if(errorUsername){
                    data.error.username = errorUsername;
                }
            }else if($email[0]){
                var errorEmail = validation.email($email.val());
                if(errorEmail){
                    data.error.email = errorEmail;
                }
            }else{
                return ViewMessage("invalid_login", "error");
            }

            var errorPassword = validation.password($password.val());
            if(errorPassword){
                data.error.password = errorPassword;
            }

            if(!_.isEmpty(data.error)){
                return ViewMessageFromData($this, data);
            }

            var action = $this.attr("action");
            $.ajax({
                url: action,
                data: $this.serialize(),
                dataType: "json",
                type: "POST",
                success: function(data){
                    ViewMessageFromData($this, data);
                }
            });
            return false;
        });

        $body.on('submit', '#RecoveryForm', function(e){
            e.preventDefault();
            var $this = $(this);
            var $email = $this.find('.js-vn[data-type=email]');
            var data = { error: {} };

            var errorEmail = validation.email($email.val());
            if(errorEmail){
                data.error.email = errorEmail;
            }

            if(!_.isEmpty(data.error)){
                return ViewMessageFromData($this, data);
            }

            var action = $this.attr("action");
            $.ajax({
                url: action,
                data: $this.serialize(),
                dataType: "json",
                type: "POST",
                success: function(data){
                    ViewMessageFromData($this, data);
                }
            });
            return false;
        });

        $body.on('submit', '#RegisterForm', function(e){
            e.preventDefault();
            var $this = $(this);
            var $username = $this.find('.js-vn[data-type=username]');
            var $email = $this.find('.js-vn[data-type=email]');
            var $password = $this.find('.js-vn[data-type=password]');
            var $confirm = $this.find('.js-vn[data-type=confirm]');
            var data = { error: {} };

            var errorUsername = validation.username($username.val());
            if(errorUsername){
                data.error.username = errorUsername;
            }

            var errorEmail = validation.email($email.val());
            if(errorEmail){
                data.error.email = errorEmail;
            }

            var errorPassword = validation.password($password.val());
            if(errorPassword){
                data.error.password = errorPassword;
            }

            var errorConfirmPassword = validation.confirmPassword($password.val(), $confirm.val());
            if(errorConfirmPassword){
                data.error.confirm = errorConfirmPassword;
            }

            if(!_.isEmpty(data.error)){
                return ViewMessageFromData($this, data);
            }

            var action = $this.attr("action");
            $.ajax({
                url: action,
                data: $this.serialize(),
                dataType: "json",
                type: "POST",
                success: function(data){
                    ViewMessageFromData($this, data);
                }
            });
            return false;
        });

        $('#ProfileForm').on('change', '.js-change', function(e){
            var $this = $(this);
            var formData = new FormData();
            var type = $this.data('type');
            var val = $this.val();
            var data = { error: {} };

            try {
                if(type === "phone") {
                    var errorPhone = validation.phone(val);
                    if (errorPhone) {
                        data.error.phone = errorPhone;
                    } else {
                        formData.append("phone", val);
                    }
                }else if(type === "username") {
                    var errorUsername = validation.username(val);
                    if (errorUsername) {
                        data.error.username = errorUsername;
                    } else {
                        formData.append("username", val);
                    }
                }else if (type === "photo") {
                    formData.append("photo", $this[0].files[0]);
                }else if(type === "email") {
                    var errorEmail = validation.email(val);
                    if (errorEmail) {
                        data.error.email = errorEmail;
                    } else {
                        formData.append("email", val);
                    }
                }else if(type === "confirm") {
                    var password = $this.data('password');
                    var $password = $(password);
                    var errorPassword = validation.password($password.val());
                    if (errorPassword) {
                        data.error.password = errorPassword;
                    } else {
                        formData.append("password", $password.val());
                    }

                    var errorConfirmPassword = validation.confirmPassword($password.val(), val);
                    if (errorConfirmPassword) {
                        data.error.confirm = errorConfirmPassword;
                    } else {
                        formData.append("confirm", $password.val());
                    }
                }else return;

                if(!_.isEmpty(data.error)){
                    return ViewMessageFromData($this, data);
                }

                var action = $this.attr("action");
                
                $.ajax({
                    url: action,
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: "json",
                    type: "POST",
                    beforeSend: function(){
                      $body.addClass('isWaitCursor');
                    },
                    complete: function(){
                        $body.removeClass('isWaitCursor');
                    },
                    success: function (data) {
                        ViewMessageFromData($this, data);
                    },
                    error: function(e){
                        console.error(e);
                        ViewMessage("server_error", "error");
                    }
                });
            }catch(e){
                console.error(e);
                return ViewMessage("invalid_data", "error");
            }
            return false;
        });

        $('.isAvatar').on('load', function () {
            var $this = $(this);
            transformAvatar();
        });

        setInterval(function(){
            transformAvatar();
        }, 1000);
    };

    // Header Functions
    var runHeader = function() {

    };

    // Form related Functions
    var runComponents = function() {

        var initTab = function($this){
            if(!$this[0]) return;
            var tab = $this.data('tab');
            $('[data-tab]').removeClass('active');
            $('.js-isTab').removeClass('active');
            $(tab).addClass('active');
            $this.addClass('active');
        };

        // Tabs:
        $('body').on('click', '[data-tab]:not(.active)', function() {
            var $this = $(this);
            initTab($this);
        });

        var tab = hash.get().tab;
        initTab($('[data-tab="#' + tab + '"]'));
        hash.remove('tab');
    };

    return {
        init: function() {
             setTimeout(function(){
                preloader();
            }, 2000);
            runGlobalScripts();
            runFormEvents();
            runSidebars();
            runComponents();
            runHeader();
        }
    }
}();