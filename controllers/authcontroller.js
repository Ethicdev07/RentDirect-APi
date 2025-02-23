const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const googleCallBack = async (req, res) => {
    try {   
        const token = generateToken(req.user);
        res.redirect(`http://localhost:8080/auth/google/callback?token=${token}`);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const register = async (req, res) => {
    try {
        const {email, password, fullName, phoneNumber} = req.body;

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({ error: "Email already registered"});
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email, 
            password: hashPassword,
            fullName,
            phoneNumber
        });
        const token = generateToken(user); 
        res.status(200).json({user, token});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }); 

        if(!user || !user.password) {
            return res.status(401).json({ error: "Invalid Credentials"})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({ error: "Invalid Credentials"})
        }

        const token = generateToken(user); 
        res.json({user, token})
    } catch (error) {
        res.status(400).json({ error: error.message})
    }
}


module.exports = { register, login, googleCallBack }