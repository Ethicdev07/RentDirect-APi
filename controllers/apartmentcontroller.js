const Apartment = require('../models/Apartment');

const createApartment = async (req, res) => {
    try {
      const { title, description, address, rent, amenities, available } = req.body;
  
      // Ensure at least 5 images are uploaded
      if (!req.files || req.files.length < 5) {
        return res.status(400).json({ error: "At least 5 images are required" });
      }
  
      // Get uploaded image URLs
      const images = req.files.map(file => file.path); 
  
      const apartment = await Apartment.create({
        owner: req.user._id,
        title,
        description,
        location: { address },
        rent,
        images,
        available,
        amenities: amenities.split(',').map(a => a.trim()) // Convert to an array
      });
  
      res.status(201).json(apartment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };



    const getAll = async (req, res) => {
        try {
            const apartments = await Apartment.find();
            return res.status(200).json({
                success: true,
                data: apartments,
                count: apartments.length
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                details: error.message
            });
        }
    };

    const getOne = async (req, res) => {
        try {
            const apartment = await Apartment.findById(req.params.id);
            
            if (!apartment) {
                return res.status(404).json({
                    success: false,
                    error: 'Apartment not found'
                });
            }
    
            return res.status(200).json({
                success: true,
                data: apartment
            });
        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid apartment ID'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                details: error.message
            });
        }
    };

    const update = async (req, res) => {
        try {
            const apartment = await Apartment.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );
    
            if (!apartment) {
                return res.status(404).json({
                    success: false,
                    error: 'Apartment not found'
                });
            }
    
            return res.status(200).json({
                success: true,
                data: apartment
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    error: messages
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                details: error.message
            });
        }
    };
    const deleteApartment = async (req, res) => {
        try {
            const apartment = await Apartment.findByIdAndDelete(req.params.id);
    
            if (!apartment) {
                return res.status(404).json({
                    success: false,
                    error: 'Apartment not found'
                });
            }
    
            return res.status(200).json({
                success: true,
                data: {},
                message: 'Apartment deleted successfully'
            });
        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid apartment ID'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                details: error.message
            });
        }
    };

module.exports = {
  createApartment,
  getAll,
  getOne,
  update,
  deleteApartment,
};