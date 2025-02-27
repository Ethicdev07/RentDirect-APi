const axios = require("axios");

const getCoordinates = async (address) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address,
          key: apiKey,
        },
      }
    );

    const data = response.data;
    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      return { latitude: location.lat, longitude: location.lng };
    } else {
      throw new Error("Invalid address");
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
};

module.exports = { getCoordinates };
