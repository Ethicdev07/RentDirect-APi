const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.googleCallBack = async (req, res) => {
    try {   
        const token = generateToken(req.user);
        res.redirect(`http://localhost:8080/auth/google/callback?token=${token}`);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}