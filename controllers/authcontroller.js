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

// const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.query;

//     const verificationRecord = await VerificationToken.findOne({ token });

//     if (!verificationRecord) {
//       return res
//         .status(400)
//         .json({ error: "Invalid or expired verification link." });
//     }

//     await User.findByIdAndUpdate(verificationRecord.userId, {
//       isVerified: true,
//     });
//     await VerificationToken.deleteOne({ token });

//     res
//       .status(200)
//       .json({ message: "Email successfully verified. You can now log in." });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

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
    next(error)
  }
};

module.exports = { register, login, googleCallBack, verifOtp };
