const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authmiddleware");
const { imageUploads } = require("../utils/multer");
const {
  createApartment,
  searchApartments,
  getOne,
  getAll,
  update,
  deleteApartment,
} = require("../controllers/apartmentcontroller");

router.post("/", protect, async (req, res) => {
  imageUploads(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }

      if (!req.files || req.files.length < 5) {
        return res
          .status(400)
          .json({ error: "Please upload at least 5 images" });
      }

      req.body.images = req.files.map((file) => file.path);

      await createApartment(req, res);
    } catch (error) {
      res
        .status(500)
        .json({ error: error.message || "Error creating apartment" });
    }
  });
});


router.get("/search", searchApartments);
router.get("/:id", getOne);
router.get("/", getAll);
router.put("/:id", protect, update);
router.delete("/:id", protect, deleteApartment);

module.exports = router;
