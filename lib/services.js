'use strict';

var striptags = require('striptags');
var moment = require('moment');

var Services = {
	unixTime: function(){
		return parseInt(new Date().getTime()/1000)
	},
	clearStr: function(str){
		str = striptags(str);
		str = this.escapeStr(str);
		return str;
	},
	userLog: function(data){
      try{
          (reqlib('/models/userLog')).create(data);
      }catch(e){
          logger.error(e);
      }
	},
	sendError: function(error, res){
		res.send({
			error: error
		});
		res.end();
		return;
	},
	sendSuccess: function(msg, res){
		res.send({
			msg: msg
		});
		res.end();
		return;
	},
	isObjectID: function(id){
		return (id).match(/^[0-9a-z]*$/) !== null;
	},
	genUserName: function(val){
		let name = val.username;
		
        if (val.displayName) {
            name = val.displayName
        }

        return name;
	},
	checkAdmin: function(req, res, next){
		if("user" in req.session){
			if(("role" in req.session.user)) {
				var role = parseInt(req.session.user.role);
				if (isNaN(role)) role = 0;
				if(role > 0){
					res.locals.adminpanel = true;
					return next();
				}
			}
		}
		this.redirect(res, "/404");
	},
	redirect: function(res, path, code){
		try{
			if(!code) code = 302;
			if(!path) path = "/";
			res.redirect(code, path);
			res.end();
		}catch(e){
			logger.error(e);
			res.redirect(302, "/");
			res.end();
		}
	},
	validation: {
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
		password: function(v){
			var error = null;
			let msg = "invalid_password";
			if(typeof v !== "string" || !v){
				error = msg;
			}else if(v.length < 5){
				error = msg + "_min";
			}else if(v.length > 151){
				error = msg + "_max";
			}
			return error;
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
			if(v.toString().length > 0){
				if (!v.match(/^([a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*\.[a-zA-Z]{2,6}$/)) {
					error = "invalid_email";
				}
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
	},
	paginator: function(req, res, count, page, limit, limitPages, url){
		var pages = [];
		if(!url)
			url = req.baseUrl;
		if(!page) page = 1;
		var active = parseInt(page);
		var originUrl = url.replace(/(.*)(\&|\?)page\=\d*(.*)?/, "$1$3");
		var countPages = parseInt(Math.ceil(count / limit));
		if (((active > countPages) && (active > 1)) || active <= 0 || isNaN(active)) {
			this.redirect(req, res, originUrl, true);
			return false;
		}
		var urlPage = url.replace(/^(.*)(page)\=?(\d*)(.*)?$/, "$1$2#p#$4");
		var addPageToUrl = function(URL, page){
			if(URL.match(/\#p\#/))
				return URL.replace(/\#p\#/, ("=" + page));
			else if(URL.match(/\?/))
				return URL + "&page=" + page;
			else
				return URL + "?page=" + page;
		};
		if(countPages > 1) {
			if (active != 1) {
				pages[0] = {
					href: originUrl,
					title: 'first'
				};
				pages[1] = {
					href: originUrl,
					title: 'prev'
				};
				if (active != 2) {
					pages[1]['href'] = addPageToUrl(urlPage, (active - 1));
				}
			} else {
				pages[0] = {
					href: originUrl,
					title: 'first',
					isDisabled: true
				};
				pages[1] = {
					href: originUrl,
					title: 'prev',
					isDisabled: true
				};
			}
			var left = active - 1;
			var right = countPages - active;
			var end = 0, start = 0;
			if (left < Math.floor(limitPages / 2)) start = 1;
			else start = active - Math.floor(limitPages / 2);
			end = start + limitPages - 1;
			if (end > countPages) {
				start -= (end - countPages);
				end = countPages;
				if (start < 1) start = 1;
			}
			for (var i = start; i < (end + 1); i++) {
				if (i === active) {
					pages[i] = {
						href: "#",
						title: i,
						isActive: true
					};
				} else {
					pages[i] = {
						href: (i == 1) ? url : addPageToUrl(urlPage, i),
						title: i
					};
				}
			}
			var offset = countPages + 1;
			if (active != countPages) {
				pages[offset] = {
					href: addPageToUrl(urlPage, (active + 1)),
					title: 'next'
				};
				pages[offset + 1] = {
					href: addPageToUrl(urlPage, countPages),
					title: 'last'
				};
			} else {
				pages[offset] = {
					href: addPageToUrl(urlPage, (active + 1)),
					title: 'next',
					isDisabled: true
				};
				pages[offset + 1] = {
					href: addPageToUrl(urlPage, countPages),
					title: 'last',
					isDisabled: true
				};
			}
		}else pages = null;
		return pages;
	},
	getDateNow: function(){
		return moment().format("YYYY-MM-DD HH:mm:ss");
	},
	getDateStartOf: function(string){
		return moment().startOf(string).format("YYYY-MM-DD HH:mm:ss");
	},
	getDateEndOf: function(string){
		return moment().endOf(string).format("YYYY-MM-DD HH:mm:ss");
	},
	startTimer: function(time, success, socket) {
		var timeCurr = time;
		function timer(){
		    var arr = timeCurr.split(":");
		    var h = arr[0];
		    var m = arr[1];
		    var s = arr[2];
		    if (s == 0) {
		      if (m == 0) {
		        if (h == 0) {
		          success();
		          return;
		        }
		        h--;
		        m = 60;
		        if (h < 10) h = "0" + h;
		      }
		      m--;
		      if (m < 10) m = "0" + m;
		      s = 59;
		    }
		    else s--;
		    if (s < 10) s = "0" + s;
		    if(!stopTimer){
		    	timeCurr = h + ":" + m + ":" + s;
		    }else{
		    	timeCurr = "00:00:00";
		    }
		    socket.sendEmit("timer", timeCurr.replace(/^[0-9]{2}\:/,""));
		    setTimeout(timer, 1000);
		}
		timer();
	},
	escapeStr: function (str) {
	    if (typeof str != 'string')
	        return str;

	    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
	        switch (char) {
	            case "\0":
	                return "\\0";
	            case "\x08":
	                return "\\b";
	            case "\x09":
	                return "\\t";
	            case "\x1a":
	                return "\\z";
	            case "\n":
	                return "\\n";
	            case "\r":
	                return "\\r";
	            case "\"":
	            case "'":
	            case "\\":
	            case "%":
	                return "\\"+char; // prepends a backslash to backslash, percent,
	                                  // and double/single quotes
	        }
	    });
	}
};

module.exports = Services;