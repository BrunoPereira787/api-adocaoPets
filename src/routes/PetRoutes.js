const router = require("express").Router();
const PetController = require("../controllers/PetController");
const verifyToken = require("../middlewares/verifyToken");
const { imageUpload } = require("../middlewares/ImageUpload");

router.get("/", PetController.petsAll);
router.post(
  "/create",
  verifyToken,
  imageUpload.array("images"),
  PetController.create
);
router.get("/mypets", verifyToken, PetController.getUserPets);
router.get("/pet/:id", PetController.getUserPetById);
router.delete("/deletepet/:id", verifyToken, PetController.deletePetById);
router.patch(
  "/updatepet/:id",
  verifyToken,
  imageUpload.array("images"),
  PetController.updatePet
);
router.patch("/concludes/:id", verifyToken, PetController.concludeAdoption);

module.exports = router;
