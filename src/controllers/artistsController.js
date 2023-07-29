const pool = require("../db");
const { getCurrentDate } = require("../helpers/dateHelpers");

//POST /artists
const createArtist = async (req, res) => {
  const { name } = req.body;
  const createdAt = getCurrentDate();

  try {
    const queryText =
      "INSERT INTO artists(name, created_at) VALUES($1, $2) RETURNING id";
    const values = [name, createdAt];
    const result = await pool.query(queryText, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Horror artist" });
  }
};

const getArtists = async (req, res) => {
  const queryText = "SELECT * FROM artists";
  try {
    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.log("HORRROR artists");
  }
};

const getArtist = async (req, res) => {
  const { id } = req.params;

  const queryText = "SELECT * FROM artists WHERE id = $1";
  const value = [id];
  try {
    const result = await pool.query(queryText, value);
    return result.rows.length === 0
      ? res.status(404).json({ message: "Artist not found" })
      : res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Horror Artist" });
  }
};

const deleteArtist = async (req, res) => {
  const { id } = req.params;

  const queryText = "DELETE FROM artists WHERE id = $1";
  const value = [id];
  try {
    const result = await pool.query(queryText, value);

    return result.rowCount === 0
      ? res.status(404).json({ message: "Artist not found" })
      : res.sendStatus(204);
  } catch (error) {
    console.error(error.message); // manejo de error
    res.status(500).json({ error: "Horror artist" });
  }
};

const updateArtist = async (req, res, next) => {
  const id = req.params.id;
  const body = req.body;
  const columns = [];
  const values = [];
  const updatedAt = getCurrentDate();
  let argumentCount = 1;

  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      columns.push(`${key} = $${argumentCount}`);
      values.push(body[key]);
      argumentCount++;
    }
  }

  columns.push(`updated_at = $${argumentCount}`);
  values.push(updatedAt);

  values.push(id);

  const queryText = `UPDATE artists SET ${columns.join(", ")} WHERE id = $${
    argumentCount + 1
  }`;
  try {
    const result = await pool.query(queryText, values);

    return result.rowCount === 0
      ? res.status(404).json({ message: "User not found" })
      : res.status(200).json({ message: "Artist updated successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "An error occurred" });
  }
};

module.exports = {
  createArtist,
  deleteArtist,
  updateArtist,
  getArtists,
  getArtist,
};
