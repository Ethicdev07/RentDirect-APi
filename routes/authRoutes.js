const express = require('express');
const passport = require('passport');
const { register, login, googleCallBack, verifyEmail } = require('../controllers/authcontroller')

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/verify-email', verifyEmail);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL + '/login' }),
    googleCallBack
);


module.exports = router; 