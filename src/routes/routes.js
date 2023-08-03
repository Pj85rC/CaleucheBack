const { Router } = require("express");
const authenticateToken = require("../middlewares/authTokenMiddleware");

// const pool = require('../db')

const {
  getFestivals,
  getFestival,
  createFestival,
  deleteFestival,
  updateFestival,
  getLineup,
  addArtistToLineup,
  removeArtistFromLineup,
} = require("../controllers/festivalController");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getFavourites,
  addFavourites,
  deleteFavourite,
  login,
  testDb,
} = require("../controllers/userController.js");

const {
  createArtist,
  deleteArtist,
  updateArtist,
  getArtists,
  getArtist,
} = require("../controllers/artistsController.js");

const router = Router();

router.get("/festivals", getFestivals);
router.get("/festivals/:id", authenticateToken, getFestival);
router.post("/festivals", authenticateToken, createFestival);
router.delete("/festivals/:id", authenticateToken, deleteFestival);
router.patch("/festivals/:id", authenticateToken, updateFestival);
router.get("/festivals/:id/lineup", authenticateToken, getLineup);
router.post("/festivals/:id/lineup", authenticateToken, addArtistToLineup);
router.delete(
  "/festivals/:id/lineup/artistId",
  authenticateToken,
  removeArtistFromLineup
);

router.get("/testdb", testDb);
router.get("/users", authenticateToken, getUsers);
router.get("/users/:id", authenticateToken, getUser);
router.post("/users", authenticateToken, createUser);
router.patch("/users/:id", authenticateToken, updateUser);
router.delete("/users/:id", authenticateToken, deleteUser);
router.get("/users/:user_id/favourites", authenticateToken, getFavourites);
router.post("/users/:user_id/favourites", authenticateToken, addFavourites);
router.delete(
  "/users/:user_id/favourites/:festival_id",
  authenticateToken,
  deleteFavourite
);
router.post("/login", login);

router.get("/artists", authenticateToken, getArtists);
router.get("/artists/:id", authenticateToken, getArtist);
router.post("/artists", authenticateToken, createArtist);
router.delete("/artists/:id", authenticateToken, deleteArtist);
router.patch("/artists/:id", authenticateToken, updateArtist);

module.exports = router;
