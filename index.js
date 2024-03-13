import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import multer from 'multer';
import userRouter from './Routes/user.js'
import AWS  from 'aws-sdk';

const PORT = process.env.PORT || 5003;
dotenv.config();
const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.get("/", (req, res) => res.status(200).send("Hello world!!!!!!"));

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

AWS.config.update({
  accessKeyId: 'AKIAU5FA3AS4N3SGVO6F',
  secretAccessKey: '0Uo18kboBtarVYXR3qciKeRfiTEDDt5fN8aQtyle',
  region: 'us-east-1', // Change to your region
});

 
////////////////////////////////////////////////////////////////////////////
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, }).then(() => { console.log('Connected Succesfully.') }).catch((err) => console.log('no connection ', err))
const server = app.listen(PORT, () => console.log("Listening on port ", PORT)); 