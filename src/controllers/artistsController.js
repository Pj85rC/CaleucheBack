const pool = require("../db");
const { getCurrentDate } = require("../helpers/dateHelpers");

//POST /artists
const createArtist = async (req, res) => {
  const { name, genres, links } = req.body;
  const createdAt = getCurrentDate();

  try {
    await pool.query('BEGIN');

    // Insert artist into artists table
    const artistQueryText = "INSERT INTO artists(name, created_at) VALUES($1, $2) RETURNING id";
    const artistValues = [name, createdAt];
    const artistResult = await pool.query(artistQueryText, artistValues);
    const artistId = artistResult.rows[0].id;

    if (genres && genres.length) {
      // Check or insert genres into genres table
      const genreIds = [];
      for (const genre of genres) {
        let result = await pool.query("SELECT id FROM genres WHERE name = $1", [genre]);
        if (result.rows.length === 0) {
          result = await pool.query("INSERT INTO genres(name) VALUES($1) RETURNING id", [genre]);
        }
        genreIds.push(result.rows[0].id);
      }

      // Insert artist-genre relationships
      const genreQueryText = "INSERT INTO artist_genre(artist_id, genre_id) VALUES " + genreIds.map((id, index) => `(${artistId}, $${index + 1})`).join(", ");
      await pool.query(genreQueryText, genreIds);
    }

    if (links && links.length) {
      // Insert links
      const linksQueryText = "INSERT INTO artist_links(artist_id, platform, url) VALUES " + links.map((link, index) => `(${artistId}, $${index * 2 + 1}, $${index * 2 + 2})`).join(", ");
      const linkValues = [].concat(...links.map(link => [link.platform, link.url]));
      await pool.query(linksQueryText, linkValues);
    }

    await pool.query('COMMIT');

    res.json(artistResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error.message);
    res.status(500).json({ error: "Horror artist" });
  }
};

const getArtists = async (req, res) => {
  const queryText = `
  SELECT 
  a.id, 
  a.name, 
  a.created_at, 
  a.updated_at, 
  a.photo_url,
  genres.genres,
  links.links
FROM artists a
LEFT JOIN (
  SELECT 
    ag.artist_id, 
    array_agg(DISTINCT g.name) as genres
  FROM artist_genre ag
  JOIN genres g ON ag.genre_id = g.id
  GROUP BY ag.artist_id
) AS genres ON a.id = genres.artist_id
LEFT JOIN (
  SELECT 
    al.artist_id, 
    jsonb_agg(jsonb_build_object('platform', al.platform, 'url', al.url)) as links
  FROM artist_links al
  GROUP BY al.artist_id
) AS links ON a.id = links.artist_id;
  `;

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

  try {
    await pool.query('BEGIN');

    await pool.query("DELETE FROM artist_genre WHERE artist_id = $1", [id]);
    await pool.query("DELETE FROM artist_links WHERE artist_id = $1", [id]);
    const result = await pool.query("DELETE FROM artists WHERE id = $1", [id]);

    await pool.query('COMMIT');

    return result.rowCount === 0
      ? res.status(404).json({ message: "Artist not found" })
      : res.sendStatus(204);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error.message);
    res.status(500).json({ error: "Horror artist" });
  }
};

const updateArtist = async (req, res) => {
  const id = req.params.id;
  const { name, genres, links } = req.body;
  const updatedAt = getCurrentDate();

  try {
    await pool.query('BEGIN');

    if (name) {
      const updateArtistQuery = "UPDATE artists SET name = $1, updated_at = $2 WHERE id = $3";
      await pool.query(updateArtistQuery, [name, updatedAt, id]);
    }

    if (genres) {
      // Delete existing genres for the artist
      await pool.query("DELETE FROM artist_genre WHERE artist_id = $1", [id]);
      
      // Insert new genres for the artist
      const genreQueryText = "INSERT INTO artist_genre(artist_id, genre_id) VALUES " + genres.map((genre, index) => `(${id}, $${index + 1})`).join(", ");
      await pool.query(genreQueryText, genres);
    }

    if (links) {
      // Delete existing links for the artist
      await pool.query("DELETE FROM artist_links WHERE artist_id = $1", [id]);
      
      // Insert new links for the artist
      const linksQueryText = "INSERT INTO artist_links(artist_id, platform, url) VALUES " + links.map((link, index) => `(${id}, $${index * 2 + 1}, $${index * 2 + 2})`).join(", ");
      const linkValues = [].concat(...links.map(link => [link.platform, link.url]));
      await pool.query(linksQueryText, linkValues);
    }

    await pool.query('COMMIT');

    res.status(200).json({ message: "Artist updated successfully" });
  } catch (err) {
    await pool.query('ROLLBACK');
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
