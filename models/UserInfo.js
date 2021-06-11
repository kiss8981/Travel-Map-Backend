const mongoose = require('mongoose');
var Schema = mongoose.Schema;



var userInfoSchema = new Schema({
    user_token: String,
    user_id: String,
    user_name: String,
    user_email: String,
    published_date: { type: Date, default: Date.now }
}, {collection: 'userinfo'});

var UserInfo = mongoose.model('userinfo', userInfoSchema);

module.exports = { UserInfo }