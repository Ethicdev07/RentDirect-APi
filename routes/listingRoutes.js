const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authmiddleware");
const { imageUploads } = require("../utils/multer");
const {
  createApartment,
  searchApartments,
  updateApartment,  
  deleteApartment,
  getAllApartments,
  incrementViews,
  toggleLike,
  addComment,
} = require("../controllers/listingcontroller");

router.post("/", protect, imageUploads, async (req, res) => {
  try {
    if (!req.files || req.files.length < 5) {
      return res.status(400).json({ error: "Please upload at least 5 images" });
    }

    req.body.images = req.files.map((file) => file.path);

    await createApartment(req, res);
    
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Error creating apartment" });
  }
});

router.get("/search", searchApartments);
router.get("/", getAllApartments);
router.put("/:id", protect, updateApartment);
router.delete("/:id", protect, deleteApartment);
router.put("/:id/views", incrementViews);
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);

module.exports = router;
