const mongoose = require("mongoose");
require('dotenv').config();

if (process.env.NODE_ENV === "development") {

  const uri = 'mongodb://localhost:27017/plan-it';
  mongoose.Promise = global.Promise;
  mongoose.connect(
    uri, 
    { 
      useNewUrlParser: true, useUnifiedTopology: true
    })
    .then(
        () => {console.log('Database is connected') },
        err => { console.log('Can not connect to the database'+ err)}
    );
} else if (process.env.NODE_ENV === "production") {

  const uri = process.env.MONGODB_URI;
  mongoose.Promise = global.Promise;
  mongoose.connect(
    uri, 
    { 
      useNewUrlParser: true, useUnifiedTopology: true
    })
    .then(
        () => {console.log('Database is connected') },
        err => { console.log('Can not connect to the database'+ err)}
    );
}
module.exports = mongoose.connection;