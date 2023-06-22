const cors = require("cors");
const express = require("express");
const path = require("path");
const meetDateRoute = require("./routes/meet.date.routes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});

app.use("/dates", meetDateRoute);

require("./config/db.config");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../build")));
}

app.get('/', (_req, res) => {
    return res.send('Plan it back end running')
  })

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
