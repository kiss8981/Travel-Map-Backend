const mongoose = require('mongoose');
var Schema = mongoose.Schema;



var userSchema = new Schema({
    user_id: String,
    place_name: String,
    description: String,
    latlng: String,
    img: String,
    visittime: String,
    published_date: { type: Date, default: Date.now }
}, {collection: 'user'});

var User = mongoose.model('User', userSchema);

module.exports = { User }