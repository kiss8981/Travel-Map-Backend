const mongoose = require('mongoose');
var Schema = mongoose.Schema;



var adminSchema = new Schema({
    date: String,
    msg: String,
    author: String,
    title: String,
    published_date: { type: Date, default: Date.now }
}, {collection: 'adminAlart'});

var Admin = mongoose.model('adminAlart', adminSchema);

module.exports = { Admin }