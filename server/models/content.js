const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    data: mongoose.Mixed,
    contentTypeId: String,
    createdByUserId: String,
    lastUpdatedByUserId: String,
    createdOn: Date,
    updatedOn: Date
});

module.exports = mongoose.model('Content', bookSchema);