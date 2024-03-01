import express from "express";
const router = express.Router();

import { signup, signin, email, restPassword } from "../controllers/user.js";

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/email", email);
router.post("/reset-password/:id/:token", restPassword);
// router.get("/update/Admin", updateproduct);

export default router;