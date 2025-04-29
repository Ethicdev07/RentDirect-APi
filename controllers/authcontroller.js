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


const register = async (req, res, next) => {
  const {name, email, password, role } = req.body;
  try {
    let user =  await  User.findOne({ email });
    if(user) return res.status(400).json({ message: "Email already exists"});

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; //10mins

    user = await User.create({name, email, password: hashedPassword, role, otp, otpExpires})


    //Send otp


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      to: email,
      subject: `RentDirect Email Verification`,
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`
    })

    res.status(201).json({ message: 'Registered. Verify your email with OTP.' });
    
  } catch (error) {
    next(error)
  }
};

const verifyOtp = async (req, res, next) => {
  const {email, otp} = req.body;
  try {
    const user = await User.findOne( { email });
    if(!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ message: "Invalid email or password" });
    if(!user.isVerified) {
      return res.status(400).json({ message: "Email not verified" });
    }
    const token = jwt.sign({ id: user._id, role: user.role}, process.env.JWT_SECRET, { expiresIn: '7d'});
    res.json({ token, user: { id: user._id, name: user.name, role: user.role }});
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, googleCallBack, verifyOtp };
