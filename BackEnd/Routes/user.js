import express from "express";
const router = express.Router();
// import rateLimit from 'express-rate-limit';
import { ForgotPassword, LogIn, Register, MyAccount,getalluser} from "../Controllers/user.js";

router.post("/LogIn", LogIn); 
router.post("/Register", Register); 
router.get("/getalluser", getalluser); 
router.put("/ForgotPassword", ForgotPassword); 
router.get("/MyAccount/:email", MyAccount); 

export default router; 