const express = require('express');
const passport = require('passport');
const { googleCallBack } = require('../controllers/authcontroller')

const router = express.Router();

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false,  failureRedirect: '/login' }),
    googleCallBack
);


module.exports = router; 