const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authmiddleware');
const {sendMessage, getMessages} = require('../controllers/chatcontroller');

router.post('/', protect, sendMessage);
router.get('/:userId', protect, getMessages);

module.exports = router;