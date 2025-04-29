const Apartment = require("../models/Apartment");
const Landlord = require("../models/Landlord");
const cloudinary = require("../utils/cloudinary");
const { getCoordinates } = require("../utils/geolocation");
const Comment = require("../models/Comment"); 

const createApartment = async (req, res, next) => {
  const {
    title,
    description,
    address,
    city,
    state,
    price,
    bedrooms,
    amenities,
    available,
  } = req.body;
  try {
    const landlord = await Landlord.findOne({ user: req.user._id });
    if(!landlord) return res.status(403).json({ error: "Only approved landlords can list apartments" });
  
    if (!req.files || req.files.length < 5) {
      return res.status(400).json({ error: "At least 5 images are required" });
    }

    const fullAddress = `${address}, ${city}, ${state}`;
    const coordinates = await getCoordinates(fullAddress);
    if (!coordinates) {
      return res
        .status(400)
        .json({ error: "Invalid address, please enter a valid one" });
    }

    const imageUploads = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "apartments",
        });
        return result.secure_url;
      })
    );

    const apartment = await Apartment.create({
      landlord: landlord._id,
      title,
      description,
      location: {
        address,
        city,
        state,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      price,
      bedrooms,
      amenities,
      images: imageUploads,
      available,
      amenities: amenities.split(",").map((a) => a.trim()),
    });

    res.status(201).json(apartment);
  } catch (error) {
    next(error)
  }
};


const updateApartment = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, address, city, state, price, bedrooms, amenities } = req.body;

  try {
    const apartment = await Apartment.findById(id).populate("landlord");
    if(!apartment) return res.status(404).json({ error: "Apartment not found" });

    const landlord = await Landlord.findOne({ user: req.user._id });
    if(!landlord || !landlord._id.equals(apartment.landlord._id)) {
      return res.status(403).json({ error: "You are not authorized to update this apartment" });
    };

    apartment.title = title || apartment.title;
    apartment.description = description || apartment.description;
    apartment.location.address = address || apartment.location.address;
    apartment.location.city = city || apartment.location.city;
    apartment.location.state = state || apartment.location.state;
    apartment.price = price || apartment.price;
    apartment.bedrooms = bedrooms || apartment.bedrooms;
    apartment.amenities = amenities ? amenities.split(",").map((a) => a.trim()) : apartment.amenities;
    apartment.available = req.body.available !== undefined ? req.body.available : apartment.available;
    apartment.images = req.files ? await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "apartments",
        });
        return result.secure_url;
      })
    ) : apartment.images;
    apartment.location.coordinates = await getCoordinates(`${address}, ${city}, ${state}`) || apartment.location.coordinates;
    await apartment.save();
    res.status(200).json({ success: true, data: apartment });
  } catch (error) {
    next(error);
  }
};


const deleteApartment = async (req, res, next) => {
  const { id } = req.params;
  try {
    const apartment = await Apartment.findById(id).populate("landlord");
    if (!apatment) return res.status(404).json({ error: "Apartment not found" });

    const landlord = await Landlord.findOne({ user: req.user._id });
    if (!landlord || !landlord._id.equals(apartment.landlord._id)) {
      return res.status(403).json({ error: "You are not authorized to delete this apartment" });
    }
    await apartment.remove();
    res.status(200).json({ success: true, message: "Apartment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getAllApartments = async (req, res, next) => {
  try {
    const apartments = await Apartment.find().populate("landlord", "user");
    res.status(200).json({ success: true, count: apartments.length, data: apartments });
  } catch (error) {
    next(error);
  }
};

const searchApartments = async (req, res) => {
  try {
    const {
      query,
      latitude,
      longitude,
      maxDistance = 5000,
      address,
    } = req.query;
    let filter = {};
    let orConditions = [];

    // If an address is provided, fetch coordinates using geolocation
    if (address) {
      const { getCoordinates } = require("../utils/geolocation");
      const location = await getCoordinates(address);

      if (!location) {
        return res.status(400).json({ error: "Invalid address provided" });
      }

      // Use the found latitude and longitude in the search filter
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
          },
          $maxDistance: parseInt(maxDistance), // Convert string to number
        },
      };
    } else if (latitude && longitude) {
      // If coordinates are provided, use them for nearby filtering
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }

    // Process keyword-based search
    if (query) {
      const keywords = query.toLowerCase().split(/\s+/);
      const bedroomKeyword = keywords.find((k) => /^\d+bed(room)?$/.test(k));
      if (bedroomKeyword) {
        const bedrooms = parseInt(bedroomKeyword.match(/\d+/)[0], 10);
        orConditions.push(
          {
            title: { $regex: `\\b${bedrooms}\\s*bed(room)?\\b`, $options: "i" },
          },
          {
            description: {
              $regex: `\\b${bedrooms}\\s*bed(room)?\\b`,
              $options: "i",
            },
          }
        );
      }

      let rentFilter = {};
      const underRent = keywords.find((k) => /^under\d+$/.test(k));
      const aboveRent = keywords.find((k) => /^above\d+$/.test(k));
      if (underRent)
        rentFilter.$lte = parseInt(underRent.replace("under", ""), 10);
      if (aboveRent)
        rentFilter.$gte = parseInt(aboveRent.replace("above", ""), 10);
      if (Object.keys(rentFilter).length) filter.rent = rentFilter;

      const generalKeywords = keywords.filter(
        (k) =>
          !/^\d+bed(room)?$/.test(k) &&
          !/^under\d+$/.test(k) &&
          !/^above\d+$/.test(k)
      );
      if (generalKeywords.length > 0) {
        generalKeywords.forEach((keyword) => {
          orConditions.push(
            { "location.address": { $regex: keyword, $options: "i" } },
            { "location.city": { $regex: keyword, $options: "i" } },
            { "location.state": { $regex: keyword, $options: "i" } },
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { amenities: { $regex: keyword, $options: "i" } }
          );
        });
      }
    }

    if (orConditions.length > 0) filter.$or = orConditions;

    const apartments = await Apartment.find(filter);
    return res
      .status(200)
      .json({ success: true, count: apartments.length, data: apartments });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Server Error", details: error.message });
  }
};

const incrementViews = async(req, res) => {
  try {
    const { id } = req.params;

    const apartment = await  Apartment.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if(!apartment) {
      return res.status(404).json({success: false, error: "Apartment not found"});
    }
    return res.status(200).json({success: true, data: apartment});
  } catch (error) {
    return res.status(500).json({success:false, error: "Server Error", details: error.message});
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; 

    const apartment = await Apartment.findById(id);
    if (!apartment) {
      return res.status(404).json({ success: false, error: "Apartment not found" });
    }

    const hasLiked = apartment.likes.includes(userId);

    if (hasLiked) {
      apartment.likes = apartment.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      apartment.likes.push(userId);
    }

    await apartment.save();

    return res.status(200).json({ success: true, data: apartment, message: hasLiked ? "Unliked" : "Liked" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Error", details: error.message });
  }
};


const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ success: false, error: "Comment text is required" });
    }

    const apartment = await Apartment.findById(id);
    if (!apartment) {
      return res.status(404).json({ success: false, error: "Apartment not found" });
    }

    const comment = await Comment.create({ user: userId, text, apartment: id });

    apartment.comments.push(comment._id);
    await apartment.save();

    return res.status(201).json({ success: true, data: comment });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Error", details: error.message });
  }
};


module.exports = {
  createApartment,
  updateApartment,
  deleteApartment,
  getAllApartments,
  searchApartments,
  incrementViews,
  toggleLike,
  addComment,
};
