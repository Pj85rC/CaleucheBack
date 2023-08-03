require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Routes = require("./routes/routes");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use(Routes);

app.use((err, req, res, next) => {
  return res.json({
    message: err.message,
  });
});



const server = app.listen(4000, () => {
  console.log("Server on 4000");
});

module.exports = server;