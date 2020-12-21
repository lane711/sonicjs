const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    title: String,
    createdByUserId: String,
    lastUpdatedByUserId: String,
    createdOn: Date,
    updatedOn: Date,
    url: {
        type: String,
        required: true,
        index: true,
        unique: true,
    }
});

module.exports = mongoose.model('Tag', tagSchema);