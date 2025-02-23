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

  

// Add other apartment controller methods (getAll, getOne, update, delete)...

module.exports = {
  createApartment,
  // Export other methods...
};