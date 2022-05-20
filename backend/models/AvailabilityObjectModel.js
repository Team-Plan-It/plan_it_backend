const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AvailabilityObjectModel = new Schema({
    userName: { type: String },
    availability: [{ type: Object }],
},{
    collection: 'availabilityDates'
});

module.exports = mongoose.model('AvailabilityObjectModel', AvailabilityObjectModel);