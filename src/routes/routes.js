const { Router } = require("express");

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
router.get("/festivals/:id", getFestival);
router.post("/festivals", createFestival);
router.delete("/festivals/:id", deleteFestival);
router.patch("/festivals/:id", updateFestival);
router.get("/festivals/:id/lineup", getLineup);
router.post("/festivals/:id/lineup", addArtistToLineup);
router.delete("/festivals/:id/lineup/artistId", removeArtistFromLineup);

router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/users/:user_id/favourites", getFavourites);
router.post("/users/:user_id/favourites", addFavourites);
router.delete("/users/:user_id/favourites/:festival_id", deleteFavourite);

router.get("/artists", getArtists);
router.get("/artists/:id", getArtist);
router.post("/artists", createArtist);
router.delete("/artists/:id", deleteArtist);
router.patch("/artists/:id", updateArtist);

module.exports = router;
