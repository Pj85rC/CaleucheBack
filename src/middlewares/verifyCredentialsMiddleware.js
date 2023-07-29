const jwt = require("jsonwebtoken");
const pool = require("../db");
const bcrypt = require("bcrypt");

const verifyCredentials = async (username, email, password) => {
  const values = [email, username];
  console.log(values);
  const queryText = "SELECT * FROM users WHERE (email = $1 OR username = $2)";
  const {
    rows: [user],
    rowCount,
  } = await pool.query(queryText, values);
  const { password: hashedPassword } = user;

  const passwordIsCorrect = bcrypt.compareSync(password, hashedPassword);

  if (!passwordIsCorrect || !rowCount)
    throw { code: 401, message: "Wrong email or password" };

  return user;
};

module.exports = {
  verifyCredentials,
};
