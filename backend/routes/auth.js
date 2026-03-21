const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const router = express.Router();

/**
 * REGISTER USER
 */
router.post("/register", async (req, res) => {
  try {
    const { name, phone, pin } = req.body;

    if (!name || !phone || !pin) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (pin.length !== 6) {
      return res.status(400).json({ message: "PIN must be 6 digits" });
    }

    // check if phone already exists
    const userExists = await pool.query(
      "SELECT * FROM clients WHERE phone = $1",
      [phone]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "Phone already registered" });
    }

    // hash PIN
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pin, salt);

    // insert user
    const result = await pool.query(
      "INSERT INTO clients (name, phone, pin_hash) VALUES ($1, $2, $3) RETURNING id, name, phone",
      [name, phone, pinHash]
    );

    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * LOGIN USER → returns JWT
 */
router.post("/login", async (req, res) => {
  try {
    const { phone, pin } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM clients WHERE phone = $1",
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(pin, user.pin_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, phone: user.phone },
      process.env.JWT_SECRET,  // Add this in your .env
      { expiresIn: "1d" }
    );

    res.json({
      token, // JWT token
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
