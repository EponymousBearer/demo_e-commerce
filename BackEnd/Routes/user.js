import express from "express";
const router = express.Router();
// import rateLimit from 'express-rate-limit';
import { ForgotPassword, LogIn, Register, LogOut, MyAccount,getalluser} from "../Controllers/user.js";

router.post("/LogIn", LogIn); 
router.post("/Register", Register); 
router.get("/getalluser", getalluser); 
router.put("/ForgotPassword/:id", ForgotPassword); 
router.get("/MyAccount/:id", MyAccount); 
router.post("/LogOut", LogOut);

export default router; 