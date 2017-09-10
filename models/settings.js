var mongoose = reqlib('/lib/mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var schema = new Schema({
    key: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

schema.plugin(autoIncrement.plugin, { model: 'Settings', field: 'id' });
module.exports = mongoose.model('Settings', schema);