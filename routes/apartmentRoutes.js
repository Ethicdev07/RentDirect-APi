const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const { imageUploads } = require('../utils/multer');
const { createApartment } = require('../controllers/apartmentcontroller');

router.post('/', protect, (req, res) => {
    imageUploads(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ 
                    error: err.message || 'Error uploading images' 
                });
            }

         
            if (!req.files || req.files.length < 5) {
                return res.status(400).json({ 
                    error: "Please upload at least 5 images" 
                });
            }

            
            const images = req.files.map(file => file.path);
        
            req.body.images = images;


            await createApartment(req, res);

        } catch (error) {
            res.status(500).json({ 
                error: error.message || 'Error creating apartment' 
            });
        }
    });
});

module.exports = router;