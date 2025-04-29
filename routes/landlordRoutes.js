const express = require('express');
const router = express.Router();
const { uploadVerificationDocument } = require('../controllers/landlordController');
const { protect } = require('../middleware/authmiddleware');

router.post('/upload-verification-document', protect, uploadVerificationDocument);

module.exports = router;