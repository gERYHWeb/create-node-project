var mongoose = reqlib('/lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    action: {
        type: String,
        required: true
    },
    params: {
    	type: Schema.Types.Mixed,
    	default: {}
    },
    datetime: {
    	type: Date,
    	default: Date.now()
    }
});

module.exports = mongoose.model('UserLog', schema);