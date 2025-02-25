const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function(){
            return !this.googleId;
        }
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    profilePicture: String,
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    phoneNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(value) {
                return /^\+?\d{1,15}$/.test(value);
            },
            message: 'Invalid phone number format.'
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('User', userSchema)