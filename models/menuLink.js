var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var menuLinksDataSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    }
}, {
    collection: 'menu-links'
});

var MenuLinkData = mongoose.model('MenuLinkData', menuLinksDataSchema);