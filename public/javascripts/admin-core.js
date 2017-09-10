var $body = $('body');
var AdminCore = function(){
    var $hdMsg = $('[data-module="headerMessage"]');
    var globalError = function(){
        $hdMsg.headerMessage({
            text: config.msgs['uncorrect_data'],
            type: "error"
        }).viewMessage()
    };
    function eventChangeData($this, functions){
        var type = $this.data('type');
        var id = $this.data('id');
        var content = $this.data('content');

        var url = "/admin/" + type + "/edit";
        var name = $this.attr('name');
        var val = (content) ? content : $this.val();
        val = $.trim(val);
        var formData = {};
        var ajax = {
            type: "POST",
            url: url,
            success: functions['success'],
            beforeSend: function(){
                $body.addClass('isWaitCursor');
            },
            complete: function(){
                $body.removeClass('isWaitCursor');
            },
            error: functions['error']
        };

        if(type === "users"){
            formData = new FormData();
            if(name === "photo"){
                val = $this[0].files[0];
            }
            formData.append("key", id);
            formData.append(name, val);
            ajax.processData = false;
            ajax.contentType = false;
        }else{
            formData['key'] = id;
            formData['name'] = name;
            formData['val'] = val;
        }
        ajax.data = formData;

        $.ajax(ajax);
    }

    $body.on('keyup keydown', '.js-field-change', function(){
        var $this = $(this);
        $this.removeClass('isNotValid');
    });

    $body.on('click', '.js-ajax-link', function(e){
        e.preventDefault();
        var $this = $(this);
        var link = $this.attr('href');
        link = (!link) ? $this.data('link') : link;
        if($this.hasClass('isConfirm')){
            var msg = $(this).data('msg');
            var conf = confirm(msg);
            if(!conf){
                return false;
            }
        }
        $.get(link, function(data){
            ViewMessageFromData(data);
        });
    });

    $body.on('change', '.js-field-change', function(){
        var $this = $(this);
        var $paste = $('.js-paste-' + $this.attr('name'));
        if($paste[0]){
            $paste.text($this.val());
        }
        eventChangeData($this, {
            success: function(data){
                var id = $this.data('id');
                if("error" in data){
                    if(typeof data.error === "object") {
                        var key, val, $el;
                        for(key in data.error){
                            val = data.error[key];
                        }
                        var $el = $('[data-id="' + id + '"][name="' + key + '"]');
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
                }else{
                    var msg = "";
                    if(typeof data.msg === "object"){
                        msg =  data.msg.success;
                        if("img" in data.msg){
                            if($($this.data('imgsef'))[0])
                                $($this.data('imgsef')).attr('src', data.msg.img);
                            else location.reload();
                        }
                    }else msg = data.msg;
                    $hdMsg.headerMessage({
                        text: config.getMsg(msg),
                        type: "success"
                    }).viewMessage();
                    $this.removeClass('isNotValid');
                }
            },
            error: globalError
        });
    });

    var runFormEvents = function(){
        $body.on('submit', '.js-send-form', function(e){
            e.preventDefault();
            var $form = $(this);
            var params = {
                dataType: "json",
                type: "POST"
            };
            var data = $(this).data('params');
            if(typeof params !== "object"){
              try{
                  data = JSON.parse(data);
              }catch(e){
                  globalError();
                  return;
              }
            }
            params = $.extend(data, params);
            $.ajax({
                data: $form.serialize(),
                dataType: params.dataType,
                type: params.type,
                url: params.url,
                beforeSend: function(){
                    $body.addClass('isWaitCursor');
                },
                complete: function(){
                    $body.removeClass('isWaitCursor');
                },
                success: function(data){
                    var hdMsg = "";
                    if("error" in data){
                        if(typeof data.error === "object"){
                            console.log(params);
                        }else{
                            $hdMsg.headerMessage({
                                text: config.getMsg(data.error),
                                type: "error"
                            }).viewMessage();
                        }
                    }else{
                        var msg = "";
                        if(typeof data.msg === "object"){
                            msg =  data.msg.success;
                            if("img" in data.msg){
                                if($($this.data('imgsef'))[0])
                                    $($this.data('imgsef')).attr('src', data.msg.img);
                                else location.reload();
                            }
                        }else msg = data.msg;

                        if(msg === "reload"){
                            WS.viewChat();
                            setImmediate(function(){
                                location.reload();
                            });
                            return;
                        }else if(msg === "redirect"){
                            location.replace(data.redirect);
                            return;
                        }

                        $hdMsg.headerMessage({
                            text: config.getMsg(msg),
                            type: "success"
                        }).viewMessage();
                    }
                },
                error: globalError
            });
        });

        $('.js-btn-confirm').on('click', function(){
            var msg = $(this).data('msg');
            var conf = confirm(msg);
            if(!conf){
                return false;
            }
        });
        $('.js-btn-prompt').on('click', function(){
            var msg = $(this).data('msg');
            var url = $(this).data('url');
            var id = $(this).data('id');
            var conf = prompt(msg);
            var params = $(this).data('params');
            if(conf){
                $.ajax({
                    url: url,
                    data: {
                        id: id,
                        msg: conf,
                        params: params
                    },
                    dataType: "json",
                    type: "POST",
                    beforeSend: function(){
                        $body.addClass('isWaitCursor');
                    },
                    complete: function(){
                        $body.removeClass('isWaitCursor');
                    },
                    success: function(data){
                        ViewMessageFromData(data);
                    }
                });
            }
            return false;
        });
    };

    var runGlobalEvents = function(){
        
    };

    return {
        init: function(){
            runGlobalEvents();
            runFormEvents();
        }
    }
}();

jQuery(document).ready(function($){
    AdminCore.init();
});