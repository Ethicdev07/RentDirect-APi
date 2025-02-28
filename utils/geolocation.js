const axios = require("axios");

const getCoordinates = async (address) => {
  try {
    const apiKey = process.env.OPENCAGE_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (response.data.results.length === 0) {
      throw new Error("Could not find location coordinates");
    }
    
    const { lat, lng } = response.data.results[0].geometry;
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error("Geolocation Error:", error.message);
    throw new Error("Failed to retrieve location coordinates");
  }
};

module.exports = { getCoordinates };
