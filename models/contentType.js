var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contentTypeDataSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    collection: 'content-types'
});

var ContentTypeData = mongoose.model('ContentTypeData', contentTypeDataSchema);
