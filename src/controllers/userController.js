const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getCurrentDate } = require("../helpers/dateHelpers");

const getUsers = async (req, res, next) => {
  try {
    const Users = await pool.query("SELECT * FROM users");
    res.json(Users.rows);
  } catch (error) {
    console.log("HORRROR users");
  }
};

const getUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
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
  try {
    const queryText =
      "INSERT INTO users(username, password, email, created_at) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [username, hashedPassword, email, createdAt];
    const result = await pool.query(queryText, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.log(createdAt);
    res.status(500).json({ error: "Horror user" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteUserQuery = "DELETE FROM users WHERE id = $1";
    const values = [id];

    const result = await pool.query(deleteUserQuery, values);

    return result.rowCount === 0
      ? res.status(404).json({ message: "User not found" })
      : res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error deleting user" });
  }
};

//POST/login (loguea autentica a un usuario y devuelve token de acceso [request: email, password], [res: token, user object; id, email, picture])
const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $1",
      [identifier]
    );
  } catch (error) {
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
  let argumentCount = 1;
  console.log(body);

  columns.push(`updated_at = $${argumentCount}`);
  values.push(getCurrentDate());
  argumentCount++;

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

  values.push(id);

  const queryText = `UPDATE users SET ${columns.join(
    ", "
  )} WHERE id = $${argumentCount}`;

  try {
    const result = await pool.query(queryText, values);
    res
      .status(200)
      .json({ status: "success", message: "Record updated successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "An error occurred" });
  }
};

//POST /users/:id/favorites

const addFavourites = async (req, res) => {
  const { festival_id } = req.body;
  const { user_id } = req.params;
  console.log(festival_id, user_id);
  try {
    const result = await pool.query(
      "INSERT INTO favourites (user_id, festival_id) VALUES ($1, $2) RETURNING *",
      [user_id, festival_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(404).json({ error: "Horror favourites." });
  }
};

const deleteFavourite = async (req, res) => {
  const { user_id, festival_id } = req.params;

  const deleteFavouriteQuery =
    "DELETE FROM favourites WHERE user_id = $1 AND festival_id = $2";
  const values = [user_id, festival_id];

  console.log(values);

  try {
    const result = await pool.query(deleteFavouriteQuery, values);

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
};
