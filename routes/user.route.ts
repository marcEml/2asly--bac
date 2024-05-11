import { UserController } from "../controllers/user.controller";
import auth from "../middleware/auth";
import express from "express";

const router = express.Router();

// routes for user ...

router.post("/user/create", UserController.createUser);
router.put("/user/update", auth, UserController.updateUser);
router.delete("/user/delete", auth, UserController.deleteUser);
router.post("/user/login", UserController.logUser);

export default router;
