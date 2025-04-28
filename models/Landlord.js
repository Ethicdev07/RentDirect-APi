const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema({
    user: {type:mongoose.Schema.Types.ObjectId, ref: 'User'},
    idCardUrl: String,
    proofOfOwnershipUrl: String,
    isApproved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Landlord', landlordSchema)