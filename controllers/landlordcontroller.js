const Landlord = require('../models/landlord');
const User = require('../models/user');

const uploadVerificationDocuments = async (req, res) => {
    const { idCardUrl, proofOfOwnershipUrl } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if(!user || user.role !== 'landlord'){
            return res.status(403).json( { message: 'Only landlords can upload verification documents' });
        }

        let landlord = await Landlord.findOne({ user: req.user._id });
        if(!landlord){
            landlord = new Landlord({ user: user._id, idCardUrl, proofOfOwnershipUrl });
        }else{
            landlord.idCardUrl = idCardUrl;
            landlord.proofOfOwnershipUrl = proofOfOwnershipUrl;
        }

        await landlord.save();
        res.status(200).json({ message: 'Documents uploaded successfully', landlord });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    uploadVerificationDocuments,
};