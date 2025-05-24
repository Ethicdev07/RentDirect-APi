const Message = require('[../models/Message');

const sendMessage = async (req, res) => {
    const {receiverId, content } = req.body;
    
    try {
        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            content,
        });
        res.status(201).json(message)
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
        
    }
};

const getMessages = async (req, res) => {
    const { userId } = req.params; 
    try {
        const message = await Message.find({
            $or: [
                {sender: req.user.id, receiver: userId},
                {sender: userId, receiver: req.user.id},
            ]
        }).sort({ timestamp: 1});
        res.json(message)
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error')
        
    }
};



module.exports = {sendMessage, getMessages}

