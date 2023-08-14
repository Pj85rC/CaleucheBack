const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getCurrentDate } = require("../helpers/dateHelpers");
const {
  verifyCredentials,
} = require("../middlewares/verifyCredentialsMiddleware");

const testDb = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Database connection error",
    });
  }
};

const getUsers = async (req, res, next) => {
  const queryText = "SELECT * FROM users";
  try {
    console.log(queryText);
    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.log("HORRROR users");
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  const queryText = "SELECT * FROM users WHERE id = $1";
  const value = [id];
  try {
    const result = await pool.query(queryText, value);
    return result.rows.length === 0
      ? res.status(404).json({ message: "User not found" })
      : res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Horror user" });
  }
};

//POST /USER CREAR USUARIO

const createUser = async (req, res) => {
  const { username, password, email } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdAt = getCurrentDate();
  const role = "user";

  try {
    const queryText =
      "INSERT INTO users(username, password, email, created_at, role) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [username, hashedPassword, email, createdAt, role];
    const result = await pool.query(queryText, values);

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, userName: user.username, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Horror user" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = "DELETE FROM users WHERE id = $1";
    const value = [id];

    const result = await pool.query(queryText, value);

    return result.rowCount === 0
      ? res.status(404).json({ message: "User not found" })
      : res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error deleting user" });
  }
};

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await verifyCredentials(username, email, password);
    console.log(user);
    const token = jwt.sign(
      { userId: user.id, userName: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );
    res.send(token);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "login incorrecto" });
  }
};

const getFavourites = async (req, res) => {
  const { user_id } = req.params;
  const queryText = "SELECT * FROM favourites WHERE user_id = $1";
  const value = [user_id];
  try {
    const result = await pool.query(queryText, value);

    return result.rows.length === 0
      ? res.status(404).json({ message: "No favourites found for this user" })
      : res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error favourites" });
  }
};

const updateUser = async (req, res, next) => {
  const id = req.params.id;
  const body = req.body;
  const columns = [];
  const values = [];
  const updatedAt = getCurrentDate();
  let argumentCount = 1;

  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      if (key === "password") {
        const hashedPassword = await bcrypt.hash(body[key], 10);
        columns.push(`password = $${argumentCount}`);
        values.push(hashedPassword);
      } else {
        columns.push(`${key} = $${argumentCount}`);
        values.push(body[key]);
      }
      argumentCount++;
    }
  }

  columns.push(`updated_at = $${argumentCount}`);
  values.push(updatedAt);

  values.push(id);

  const queryText = `UPDATE users SET ${columns.join(", ")} WHERE id = $${
    argumentCount + 1
  }`;

  try {
    const result = await pool.query(queryText, values);

    return result.rowCount === 0
      ? res.status(404).json({ message: "User not found" })
      : res
          .status(200)
          .json({ status: "success", message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "An error occurred" });
  }
};

//POST /users/:id/favorites

const addFavourites = async (req, res) => {
  const { festival_id } = req.body;
  const { user_id } = req.params;
  const createdAt = getCurrentDate();

  const queryText =
    "INSERT INTO favourites (user_id, festival_id, created_at) VALUES ($1, $2, $3) RETURNING *";
  const values = [user_id, festival_id, createdAt];
  try {
    const result = await pool.query(queryText, values);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(404).json({ error: "Horror favourites." });
  }
};

const deleteFavourite = async (req, res) => {
  const { user_id, festival_id } = req.params;

  const queryText =
    "DELETE FROM favourites WHERE user_id = $1 AND festival_id = $2";
  const values = [user_id, festival_id];

  console.log(values);

  try {
    const result = await pool.query(queryText, values);

    if (result.rowCount === 0) {
      res.status(404).json({ message: "Favourite not found" });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error deleting favourite" });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser,
  getFavourites,
  addFavourites,
  deleteFavourite,
  login,
  testDb,
};
