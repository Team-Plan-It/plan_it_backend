const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MeetDateModel = new Schema({
    eventName: { type: String },
    length: { type: String },
    date: { type: String },
    timezone: { type: String },
    emails: [{ type: String }],
    meetingNumber: { type: String },
    availabilityArray: {
        sunday: [{ type: Object }],
        monday: [{ type: Object }],
        tuesday: [{ type: Object }],
        wednesday: [{ type: Object }],
        thursday: [{ type: Object }],
        friday: [{ type: Object }],
        saturday: [{ type: Object }],
    },
    users: [{ type: Schema.Types.Object, ref: 'User' }],
},{
    collection: 'meetings'
});

module.exports = mongoose.model('MeetDateModel', MeetDateModel);