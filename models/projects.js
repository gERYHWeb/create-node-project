'use strict';
var mongoose = reqlib('/lib/mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    current: {
        type: String,
        required: true
    },
    pdf: {
        type: String,
        required: true
    },
    data: {
    	type: Schema.Types.Mixed,
    	default: {}
    },
    datetime: {
    	type: Date,
    	default: Date.now()
    }
});

schema.plugin(autoIncrement.plugin, { model: 'Projects', field: 'id' });
module.exports = mongoose.model('Projects', schema);