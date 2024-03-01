import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import multer from 'multer';
import userRouter from './Routes/user.js'

const PORT = process.env.PORT || 5006;
dotenv.config();
const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.get("/", (req, res) => res.status(200).send("Hello world"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Specify the destination folder to store the uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix); // Rename the file to avoid conflicts
  },
});
const upload = multer({ storage });
////////////////////////////////////////////////////////////////////////////


app.use("/auth", userRouter);

app.post('/how-to-sent-email', async (req, res) => {
  const { smel, cartItems, totalPrice, totalQuantities, docId1 } = req.body;
  const send_to = smel;
  const sent_from = "qwertyuiop1221qazxsw@gmail.com";
  const reply_to = "qwertyuiop1221qazxsw@gmail.com";
  const subjecta = "Order Confirmation mail";
  const message = ` <p>Dear ${docId1},</p>  `;
  await sendEmail(subjecta, message, send_to, sent_from, reply_to);
});
////////////////////////////////////////////////////////////////////////////
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, }).then(() => { console.log('Connected Succesfully.') }).catch((err) => console.log('no connection ', err))
const server = app.listen(PORT, () => console.log("Listening on port ", PORT)); 