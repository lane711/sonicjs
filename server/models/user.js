const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorSchema = new Schema({
    email: String
});

module.exports = mongoose.model('User', authorSchema);