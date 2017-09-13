var namespace = "/routes/admin/users.js";

// ROUTES
var config = reqlib("/config");
var _ = require("underscore");
var express = require('express');
var router = express.Router();

var Users = reqlib('/models/users');

var redirect = function(req,res){
    services.redirect(res, "/admin/users");
};

router.get('/', function(req, res){
    var page = req.query.page;
    if(page === "") {
        redirect(req, res);
        return;
    }
    var queryOptions = ("options" in req.query) ? req.query.options : false;
    var validFields = {
        "id": 0,
        "username": 0,
        "created": 0,
        "isBanned": 0,
        "email": 0,
        "displayName": 0,
        "cash": 0,
        "ip": 0
    };
    var options = {};
    if(queryOptions){
        for(var key in validFields){
            if(key in queryOptions){
                options[key] = queryOptions[key];
            }
        }
    }
    var currentPage = page;
    if(!page) page = 1;
    page = parseInt(page);
    if(page > 0) page -= 1;
    var offset = page * config.get("limit");
    var render = function(data){
         res.render('admin/users', {
             title: 'ADMINPANEL - Пользователи | Cash-roulete.com',
             data: data
         });
    };
    Users.find(options).count().exec(function(err, count){
        var pages = services.paginator(
            req, res,
            count,
            currentPage,
            config.get("limit"),
            config.get("limitPages")
        );

        var data = {
            items: null,
            pages: pages
        };

        if(count > 0){
            Users.find(options).
            limit(config.get("limit")).
            skip(offset).
            sort( { id: -1 } ).
            exec(function(itemsErr, items){
                if(itemsErr) logger.error(itemsErr);
                if(items) {
                    data.items = [];
                    var i = 0;
                    var v_item, k_item;
                    for (k_item in items) {
                        v_item = items[k_item];
                        data.items[i] = v_item;
                        i++; }
                }
                render(data);
            });
        }else{
            render(data);
        }
    });
});

router.get('/profile', async function(req, res) {
    try{
        let roundIDs = [];
        let roomIDs = [];
        let data = {};
        let id = req.query.id;

        if (!(id)){
            return redirect(req, res);
        }

        let client = await Users.findOne({
            _id: id
        }).lean().exec();
        
        if (client) {
            data.client = client;
        }

        let tickets = await Tickets.find({
            user: id
        }).lean().exec();
        
        if (tickets.length > 0) {
            for (let key in tickets) {
                let val = tickets[key];
                if (val.parentRound && !(_.indexOf(roundIDs, val.parentRound) + 1)) {
                    roundIDs.push(val.parentRound);
                }
                if (val.parentRoom && !(_.indexOf(roomIDs, val.parentRoom) + 1)) {
                    roomIDs.push(val.parentRoom);
                }
            }
        }

        let rounds = await Rounds.find({
            _id: roundIDs
        }).lean().exec();
        
        let rooms = await Rooms.find({
            _id: roomIDs
        }).lean().exec();

        data.rounds = [];
        if (rounds) {
            for (let key in rounds) {
                let val = rounds[key];
                let amount = 0;
                let count = 0;
                let roomName = "";
                for (let keyR in rooms) {
                    let valR = rooms[keyR];
                    if (valR._id.toString() === val.parentRoom.toString()) {
                        roomName = valR.name;
                    }
                }
                for (let keyT in tickets) {
                    let valT = tickets[keyT];
                    if (valT.parentRound.toString() === val._id.toString()) {
                        amount += valT.amount;
                        count += 1;
                    }
                }
                data.rounds.push({
                    id: val.id,
                    _id: val._id,
                    winAmount: val.amount,
                    tickets: {
                        amount: amount,
                        count: count
                    },
                    roomName: roomName,
                    date: val.begin
                });
            }
        }

        let withdrawals = await Withdrawals.find({
            user: id
        }).lean().exec();

        data.withdrawals = [];
        if (withdrawals) {
            for (let key in withdrawals) {
                let val = withdrawals[key];
                val.type = PAY_SYSTS[val.type];
                data.withdrawals.push(val);
            }
        };

        let deposits = await Deposits.find({
            user: id
        }).lean().exec();
        
        data.deposits = [];
        if (deposits) {
            for (let key in deposits) {
                let val = deposits[key];
                val.type = PAY_SYSTS[val.type];
                data.deposits.push(val);
            }
        };

        data.referrals = [];
        data.transfer = [];
        if(client.refUsers){
          let referrals = await Users.find({
            refParent: client._id
          }).
          lean().
          sort({id: -1}).
          exec();

          if(referrals){
            let statRefs = await StatRefs.find({
              user: {
                $in: client.refUsers
              }
            }).lean().exec();
            let stats = {};
            if(statRefs){
              for(let key in statRefs){
                let val = statRefs[key];
                let ref = val.user.toString();
                if(!(ref in stats)){
                  stats[ref] = {};
                }
                if(!(val.type in stats[ref])){
                  stats[ref][val.type] = 0;
                }
                stats[ref][val.type] += val.rate;
              }
            }
            for(let key in referrals){
              let val = referrals[key];
              let ref = val._id.toString();
              if(ref in stats){
                val.refStats = stats[ref];
                referrals[key] = val;
              }
            }
          }
          data.referrals = referrals;

        let transfer = await StatTransferMoney.find({
            $or: [
                { sender: id },
                { receiver: id }
            ]
        }).
        populate('sender', 'id username photo displayName').
        populate('receiver', 'id username photo displayName').    
        lean().exec();

          if(transfer){
            data.transfer = transfer;
          }
        }

        res.render('admin/users-profile', {
            title: 'ADMINPANEL - Пользователь | Cash-roulete.com',
            data: data
        });
    }catch(e){
        logger.error(e);
        return next();
    }
});

router.post('/edit', function(req, res) {
    reqlib('/middleware/user/profile')(req, res, null);
});

router.post('/edit-profile', function(req, res) {
    var id = req.query.id;
    if(!(id)){
        return services.sendError("forbidden", res);
    }
    Users.findOne({
        _id: id
    }, function(err, client){
        if(client){
            res.render('admin/users-profile', {
                title: 'ADMINPANEL - Пользователь | Cash-roulete.com',
                data: client
            });
        }else{
            redirect(req, res);
        }
    });
});

router.get('/delete', function(req, res){
    var id = req.query.id;
    if(!(id)){
        return services.sendError("forbidden", res);
    }
    Users.findOne({
        _id: id
    }, function(err, client){
        if(client){
            Users.remove({
                _id: id
            }, function(err){
                if (err) {
                    services.sendError("server_error", res);
                    return logger.error(err);
                }
                return services.sendSuccess("reload", res);
            });
        }else services.sendError("not_found_user", res);
    });
});

router.get('/ban', function(req, res){
    var id = req.query.id;
    if(!(id)){
        return services.sendError("forbidden", res);
    }
    Users.findOne({
        _id: id
    }, function(err, client){
        if(client){
            Users.findOneAndUpdate({
                _id: id
            }, {
                isBanned: 1
            }, { upsert:true }, function(err){
                if (err) {
                    services.sendError("server_error", res);
                    return logger.error(err);
                }
                return services.sendSuccess("reload", res);
            });
        }else services.sendError("not_found_user", res);
    });
});

router.get('/unban', function(req, res){
    var id = req.query.id;
    if(!(id)){
        return services.sendError("forbidden", res);
    }
    Users.findOne({
        _id: id
    }, function(err, client){
        if(client){
            Users.findOneAndUpdate({
                _id: id
            }, {
                isBanned: 0
            }, { upsert:true }, function(err){
                if (err) {
                    services.sendError("server_error", res);
                    return logger.error(err);
                }
                return services.sendSuccess("reload", res);
            });
        }else services.sendError("not_found_user", res);
    });
});

module.exports = router;