var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blockDataSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, {
    collection: 'blocks'
});

var BlockData = mongoose.model('BlockData', blockDataSchema);
