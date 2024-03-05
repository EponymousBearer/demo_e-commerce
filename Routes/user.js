import express from "express";
const router = express.Router();
import rateLimit from 'express-rate-limit';
import { signup, signin, email, restPassword, get_single_data, updatecontact } from "../Controllers/user.js";

const userLoginAttempts = {};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 2 login requests per windowMs
  message: 'Too many login attempts, please try again later.',
  keyGenerator: (req) => {
    // Use both IP address and user email as the key for rate limiting
    return req.body.email;
  },
  store: rateLimit.MemoryStore, // Use MemoryStore for in-memory rate limiting
});

router.post("/signin", (req, res, next) => {
  const { email } = req.body;
  const { ipp } = req.body;
  console.log('object', ipp);
  if (!userLoginAttempts[ipp]) {
    userLoginAttempts[ipp] = 1;
  } else {
    userLoginAttempts[ipp]++;
  }
  if (userLoginAttempts[email] > 2) {
    return res.status(429).json({ error: "Too many login attempts, please try again later." });
  }
  console.log(userLoginAttempts);
  next();
}, loginLimiter, signin);

router.post("/signup", signup);
router.get("/singledata/:id", get_single_data);
router.put("/updatecontact/:id", updatecontact);
router.post("/email", email);
router.post("/reset-password/:id/:token", restPassword);
// router.get("/update/Admin", updateproduct);

export default router;