const Apartment = require("../models/Apartment");
const cloudinary = require("../utils/cloudinary");
const { getCoordinates } = require("../utils/geolocation");

const createApartment = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      city,
      state,
      rent,
      bedrooms,
      amenities,
      available,
    } = req.body;

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
      owner: req.user._id,
      title,
      description,
      location: {
        address,
        city,
        state,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      rent,
      bedrooms,
      amenities,
      images: imageUploads,
      available,
      amenities: amenities.split(",").map((a) => a.trim()),
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
      count: apartments.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
      details: error.message,
    });
  }
};

const getOne = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({
        success: false,
        error: "Apartment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: apartment,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid apartment ID",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Server Error",
      details: error.message,
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
        runValidators: true,
      }
    );

    if (!apartment) {
      return res.status(404).json({
        success: false,
        error: "Apartment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: apartment,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }
    return res.status(500).json({
      success: false,
      error: "Server Error",
      details: error.message,
    });
  }
};
const deleteApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndDelete(req.params.id);

    if (!apartment) {
      return res.status(404).json({
        success: false,
        error: "Apartment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {},
      message: "Apartment deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid apartment ID",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Server Error",
      details: error.message,
    });
  }
};

const searchApartments = async (req, res) => {
  try {
    const { query, latitude, longitude, maxDistance = 5000 } = req.query;
    let filter = {};
    let orConditions = [];

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

    if (latitude && longitude) {
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

module.exports = {
  createApartment,
  getAll,
  getOne,
  update,
  deleteApartment,
  searchApartments,
};
