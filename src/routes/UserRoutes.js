const router = require("express").Router();

const UserController = require("../controllers/UserController");

const verifyToken = require("../middlewares/verifyToken");

const { imageUpload } = require("../middlewares/ImageUpload");

router.post("/register", imageUpload.single("image"), UserController.register);
router.post("/login", UserController.login);
router.get("/all", UserController.getAllUsers);
router.get("/user", UserController.getUserByToken);
router.get("/:id", verifyToken, UserController.getUserById);
router.put(
  "/edit",
  //imageUpload.single("image"),
  verifyToken,
  UserController.editUser
);
router.delete("/delete", verifyToken, UserController.deleteUser);
module.exports = router;
