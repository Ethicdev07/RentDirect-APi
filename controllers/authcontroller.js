const crypto = require('crypto');
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const VerificationToken = require("../models/VerificationToken");
const { sendVerificationEmail } = require("../utils/email");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const googleCallBack = async (req, res) => {
  try {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:8080/auth/google/callback?token=${token}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        return res
          .status(400)
          .json({
            error:
              "Email already registered but not verified. Check your email for verification.",
          });
      }
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashPassword,
      fullName,
      phoneNumber,
      isVerified: false,
    });

    
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await VerificationToken.create({
      userId: user._id,
      token: verificationToken,
    });


    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(user.email, verificationLink);

    res
      .status(200)
      .json({
        message:
          "Registration successful. Please check your email to verify your account.",
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const verificationRecord = await VerificationToken.findOne({ token });

    if (!verificationRecord) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification link." });
    }

    await User.findByIdAndUpdate(verificationRecord.userId, {
      isVerified: true,
    });
    await VerificationToken.deleteOne({ token });

    res
      .status(200)
      .json({ message: "Email successfully verified. You can now log in." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, login, googleCallBack, verifyEmail };
