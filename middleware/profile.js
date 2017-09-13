'use strict';
var namespace = "/middleware/profile.js";

var config = reqlib('/config/index');
var fs = require("fs");
var multiparty = require('multiparty');
var services = reqlib("/lib/services");
var crypto = require('crypto');
var _ = require('underscore');

// Mongoose Models
var Users = reqlib('/models/users');

module.exports = function(req, res, next) {
    var role = 0;
    var _id = "";
    var isError = false;
    var fields = {};
    if (!("user" in req.session)) return services.sendError("not_auth", res);
    role = req.session.user.role;
    _id = req.session.user._id;
    var form = new multiparty.Form();
    var uploadFile = {
        uploadPath: '',
        type: '',
        size: 0
    };
    var maxSize = 2 * 1024 * 1024;
    var supportMimeTypes = ['image/jpg', 'image/gif', 'image/jpeg', 'image/png'];

    let validField = async function(name, value) {
        try {
            var error = "";
            var typeString = (value && typeof value === "string");
            if (name === "email") {
                let user = await Users.findOne({
                    email: value
                });
                if (user) {
                    return "exists_email";
                } else {
                    error = services.validation.email(value);
                    if (error) {
                        return error;
                    }
                }
            } else if (name === "phone") {
                error = services.validation.phone(value);
                if (error) {
                    return error;
                }
            } else if (name === "username" && typeString) {
                let user = await Users.findOne({
                    username: value
                });
                if (user) {
                    return "exists_username";
                } else {
                    error = services.validation.username(value);
                    if (error) {
                        return error;
                    }
                }
            } else if (name === "firstName") {
                error = services.validation.firstName(value);
                if (error) {
                    return error;
                }
            } else if (name === "lastName") {
                error = services.validation.lastName(value);
                if (error) {
                    return error;
                }
            } else if (name === "password" && typeString) {
                error = services.validation.password(value);
                if (error) {
                    return error;
                }
            } else if (role == 1) {
                if (name === "cash" && typeString) {
                    error = services.validation.balance(value);
                    if (error) {
                        return error;
                    }
                } else if (name === "isBanned" && typeString) {
                    if (value === "0" || value === "1") {
                        return "invalid_isbanned";
                    }
                } else if (name === "role" && typeString) {
                    value = parseInt(value);
                    if (isNaN(value)) {
                        return "invalid_role";
                    }
                }
            }
        } catch (e) {
            logger.error(e);
            return "server_error";
        }
    };

    form.on("part", async function(part) {
        try {
            uploadFile.img = true;
            uploadFile.size = part.byteCount;
            uploadFile.type = part.headers['content-type'];
            var filename = crypto.randomBytes(10).toString('hex') + (part.filename).replace(/.*(\.[a-zA-Z]*)$/, "$1");
            uploadFile.path = './public/images/avatars/' + filename;
            uploadFile.thumbPath = './public/images/avatars/thumb/' + filename;
            uploadFile.url = "/images/avatars/" + filename;

            if (uploadFile.size > maxSize) {
                isError = true;
                return services.sendError('big_size_avatar', res);
            }

            if (supportMimeTypes.indexOf(uploadFile.type) == -1) {
                isError = true;
                return services.sendError('unsupported_type_img', res);
            }

            var out = fs.createWriteStream(uploadFile.path);
            part.pipe(out);
        } catch (e) {
            logger.error(e);
        }
    });

    form.on('error', function(err) {
        logger.error(err);
        if (fs.existsSync(uploadFile.path)) {
            fs.unlinkSync(uploadFile.path);
            services.sendError("not_uploaded_file", res);
        } else {
            services.sendError("error_updated_profile", res);
        }
    });

    form.on('field', function(name, value) {
        if ((_.indexOf(["login", "password", "phone", "email"], name) + 1) || role == 1) {
            fields[name] = value;
        }
    });

    form.on('close', async function() {
        if (isError) return;
        try {
            var errors = {},
                update = {};
            if (!_.isEmpty(fields)) {
                for (let key in fields) {
                    let val = fields[key].toString();
                    if (key === "key") {
                        _id = val;
                    } else {
                        let error = await validField(key, val);
                        if (error) {
                            errors[key] = error;
                        } else {
                            update[key] = val;
                        }
                    }
                }
            }

            if ("url" in uploadFile) {
                update.photo = uploadFile.url;
            }

            let client = await Users.findOne({
                _id: _id
            }).exec();
            if (!client) {
                return services.sendError("not_found_user", res);
            } else if (!_.isEmpty(errors)) {
                if (fs.existsSync(uploadFile.path)) {
                    fs.unlinkSync(uploadFile.path);
                }
                return services.sendError(errors, res);
            } else if (_.isEmpty(update)) {
                return services.sendError("invalid_data", res);
            } else {
                let log = await _.clone(update);
                let password = null;
                if ("password" in update) {
                    password = fields.password;
                    log.password = password;
                }
                await createLog({
                    user: _id,
                    action: "updateProfile",
                    params: log
                });
                if ("password" in update) {
                    update.password = Users.statEncryptPassword(client.id + password);
                }
                client = await Users.update({
                    _id: _id
                }, update, {
                    upsert: false
                }).exec();
                if (!client) {
                    return services.sendError("not_found_user", res);
                } else {
                    client = await Users.findOne({
                        _id: _id
                    }).exec();
                    if (client) {
                        services.sendSuccess({
                            success: "updated_profile",
                            img: uploadFile.url
                        }, res);
                    } else {
                        return services.sendError("invalid_data", res);
                    }
                    if (req.session.user.id == client.id) {
                        req.session.user = client;
                        res.locals.userInfo = client;
                    }
                }
            }
        } catch (e) {
            logger.error(e);
            return services.sendError("server_error", res);
        }
    });

    form.parse(req);

};