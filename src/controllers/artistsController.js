const pool = require("../db");
const { getCurrentDate } = require("../helpers/dateHelpers");

//POST /artists
const createArtist = async (req, res) => {
  const { name } = req.body;
  const createdAt = getCurrentDate();

  try {
    const queryText =
      "INSERT INTO artists(name, created_at) VALUES($1, $2) RETURNING id";
    const value = [name, createdAt];
    const result = await pool.query(queryText, value);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Horror artist" });
  }
};

const getArtists = async (req, res) => {
  try {
    const Artists = await pool.query("SELECT * FROM artists");
    res.json(Artists.rows);
  } catch (error) {
    console.log("HORRROR artists");
  }
};

const getArtist = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM artists WHERE id = $1", [
      id,
    ]);
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
  let argumentCount = 1;

  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      columns.push(`${key} = $${argumentCount}`);
      values.push(body[key]);
      argumentCount++;
    }
  }

  values.push(id);

  const queryText = `UPDATE artists SET ${columns.join(
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

module.exports = {
  createArtist,
  deleteArtist,
  updateArtist,
  getArtists,
  getArtist
};
