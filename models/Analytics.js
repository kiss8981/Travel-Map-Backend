const mongoose = require('mongoose');
var Schema = mongoose.Schema;



var analyticsSchema = new Schema({
    date: String,
    request: String,
    pageViews: String,
    bytes: String,
    published_date: { type: Date, default: Date.now }
}, {collection: 'analytics'});

var Analytics = mongoose.model('analytics', analyticsSchema);

module.exports = { Analytics }