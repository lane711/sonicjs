const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    password: String,
    createdOn: Date,
    updatedOn: Date,
    lastLoginOn: Date,
    profile: mongoose.Mixed,
    realm: []
});

module.exports = mongoose.model('User', userSchema);