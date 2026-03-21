const express = require("express");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to your dashboard",
    user: req.user,
  });
});

module.exports = router;
