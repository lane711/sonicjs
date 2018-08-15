var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pageDataSchema = new Schema({
    title: {
        type: String,
        required: true,
        somecustomprop: 'ipsum'
    },
    slug: {
        type: String,
        required: true
    },
    rows: Array,
    author: String
}, {
    collection: 'pages'
});

var PageData = mongoose.model('PageData', pageDataSchema);
