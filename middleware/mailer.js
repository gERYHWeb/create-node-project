var fs = require("fs");
var _ = require("underscore");
var rootPath = require('app-root-path');
var nodemailer = require('nodemailer');
var sendMailTransport = require('nodemailer-sendmail-transport');
let sendmail = require('sendmail')({
    silent: true
});

var readTmpl = function(tmpl){
    tmpl = "views/email/" + tmpl + ".ejs";
    return fs.readFileSync(tmpl, "utf8");
}

module.exports = async function(tmpl, params) {
    try{
        tmpl = await readTmpl(tmpl);
        tmpl = _.template(tmpl);
        tmpl = tmpl(params.htmlData);

        sendmail({
            from: params.from,
            to: params.to,
            subject: params.subject,
            html: tmpl
        }, function (err, reply) {
            if(err){
                logger.error(err && err.stack);
            }
            console.dir(reply)
        });
    }catch(e){
        logger.error(e);
        return null;
    }
}