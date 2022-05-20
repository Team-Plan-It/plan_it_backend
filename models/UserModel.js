const mongoose = require('mongoose')
const Schema = mongoose.Schema;

let UserModel = new Schema({
    userName: { type: String },
    timezone: { type: String },
    availability: [{ type: Object }]
},{
    collection: 'users'
});

module.exports = mongoose.model('UserModel', UserModel);