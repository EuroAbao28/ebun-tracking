const express = require("express");
const authenticateToken = require("../middlewares/auth");
const { getAllTools, createTool } = require("../controllers/toolController");

const router = express.Router();

router
  .route("/")
  .get(authenticateToken, getAllTools)
  .post(authenticateToken, createTool);

module.exports = router;
