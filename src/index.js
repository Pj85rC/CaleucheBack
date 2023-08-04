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

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`Server on ${port}`);
});

module.exports = server;
