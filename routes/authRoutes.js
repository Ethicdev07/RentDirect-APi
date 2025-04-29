const express = require('express');
const passport = require('passport');
const { register, login, googleCallBack, verifyOtp } = require('../controllers/authcontroller')

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/verify-otp', verifyOtp);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL + '/login' }),
    googleCallBack
);


module.exports = router; 