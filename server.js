const cors = require("cors");
const express = require("express");
const path = require("path");
const meetDateRoute = require("./routes/meet.date.routes");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["https://git.heroku.com/team-plan-it-app.git", "https://afternoon-everglades-72307.herokuapp.com/", "https://plan-it.team/"]
     
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/dates", meetDateRoute);

require("./config/db.config");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../build")));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
