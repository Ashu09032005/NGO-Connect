const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: String
});

userSchema.plugin(passportLocalMongoose); // adds username, hash, salt, and useful methods

module.exports = mongoose.model('User', userSchema);
