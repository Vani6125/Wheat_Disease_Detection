const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // App password (16 chars, no spaces)
      },
    });

    // Email 1: Send confirmation to user
    await transporter.sendMail({
      from: `"AgriLens Support" <${process.env.MAIL_USER}>`,
      to: email, // User's email
      subject: "AgriLens – We received your message",
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for contacting <b>AgriLens</b>.</p>
        <p><b>Your message:</b></p>
        <p>${message}</p>
        <br/>
        <p>Our team will contact you shortly.</p>
        <p>🌾 AgriLens Team</p>
      `,
    });

    // Email 2: Send notification to yourself
    await transporter.sendMail({
      from: `"AgriLens Contact Form" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER, // YOUR email
      subject: `New Contact Form: ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Full error:", error);
    res.status(500).json({ 
      message: "Failed to send email",
      error: error.message 
    });
  }
});

module.exports = router;