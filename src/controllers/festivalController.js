const pool = require("../db");
const { getCurrentDate } = require("../helpers/dateHelpers");

const getFestivals = async (req, res, next) => {
  try {
    // throw new Error ('Raios!! algo está mal')
    const queryText = "SELECT * FROM festivals";
    const result = await pool.query(queryText);

    res.json(result.rows);
  } catch (error) {
    console.log("HORROR");
    next(error);
  }
};

const getFestival = async (req, res, next) => {
  const { id } = req.params;

  const queryText = "SELECT * FROM Festivals WHERE id = $1";
  const value = [id];
  const result = await pool.query(queryText, value);

  try {
    return result.rows.length === 0
      ? res.status(404).json({ message: "Festival not found" })
      : res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createFestival = async (req, res, next) => {
  const { name, description, location } = req.body;
  const createdAt = getCurrentDate();

  try {
    const queryText =
      "INSERT INTO festivals (name, description, location, create_at) VALUES ($1, $2, $3, $4) RETURNING *";
    const value = [name, description, location, createdAt];
    const result = await pool.query(queryText, value);

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteFestival = async (req, res, next) => {
  const { id } = req.params;

  const queryText = "DELETE FROM festivals WHERE id = $1";
  const value = [id];
  try {
    const result = await pool.query(queryText, value);

    return result.rows.length === 0
      ? res.status(404).json({ message: "Festival not found" })
      : res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const updateFestival = async (req, res, next) => {
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

  const queryText = `UPDATE festivals SET ${columns.join(
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

//GET /festivals/:id/lineup
const getLineup = async (req, res) => {
  const { id } = req.params;
  try {
    const queryText =
      "SELECT artist_id, year FROM lineup WHERE festival_id = $1";
    const value = [id];
    const result = await pool.query(queryText, value);
    return result.rows.length === 0
      ? res.status(404).json({ message: "Lineup not found" })
      : res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

//POST /festivals/:id/lineup
const addArtistToLineup = async (req, res) => {
  const { id } = req.params;
  const { artistId, year } = req.body; //assuming artist id is passed in request body
  try {
    const queryText =
      "INSERT INTO lineup(festival_id, artist_id, year) VALUES($1, $2, $3) RETURNING id";
    const values = [id, artistId, year];
    const result = await pool.query(queryText, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
};

//DELETE /festivals/:id/lineup/:artistId
const removeArtistFromLineup = async (req, res) => {
  const { id, artistId } = req.params;
  try {
    const queryText =
      "DELETE FROM lineup WHERE festival_id = $1 AND artist_id = $2";
    const values = [id, artistId];
    const result = await pool.query(queryText, values);

    return result.rowCount === 0
      ? res
          .status(404)
          .json({ message: "Artist not found in this festival lineup" })
      : res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getFestivals,
  getFestival,
  createFestival,
  deleteFestival,
  updateFestival,
  getLineup,
  addArtistToLineup,
  removeArtistFromLineup
};
