import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import multer from 'multer';
import userRouter from './Routes/user.js'
import AWS  from 'aws-sdk';
import fs from 'fs'
import { createClient } from '@deepgram/sdk'
import session from "express-session";
import cron from 'node-cron';
import userSession from './Model/UserSession.js'

const PORT = process.env.PORT || 5003;
dotenv.config();
const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.get("/", (req, res) => res.status(200).send("Hello world"));
app.use(session({
  secret: 'secret', // Change this to a random string
  resave: false,
  saveUninitialized: true
}));

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
app.post('/ap', async (req, res) => {
  try {
      let audioData = req.body.audio; // Accessing the audio data from the request body

      // Remove data URI prefix
      const base64DataWithoutPrefix = audioData.replace(/^data:audio\/wav;base64,/, '');

      // Convert base64 to binary buffer
      const binaryData = Buffer.from(base64DataWithoutPrefix, 'base64');

      // Write binary data to .wav file 
      fs.writeFileSync('audio.wav', binaryData);
      console.log('Audio file saved as audio.wav');

      // Call transcribeFile with the file path
      const transcript = await transcribeFile('audio.wav');
      // const aiResponse = await getAIResponse(transcript);

      console.log(transcript);

   
      res.json({ transcript });
  } catch (error) {
      console.error('Error processing audio:', error);
      res.status(500).json({ error: 'Error processing audio' });
  }
});
const transcribeFile = async (filePath) => {
  console.log('object');
  // STEP 1: Create a Deepgram client using the API key
  const deepgram = createClient('1cee0be838346e426c7ccc86283a04d69ca850b3');

  // STEP 2: Call the transcribeFile method with the audio payload and options
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      // path to the audio file
      fs.readFileSync(filePath),
      // STEP 3: Configure Deepgram options for audio analysis
      {
          model: "nova-2",
          smart_format: true,
      }
  );

  if (error) throw error;
  // STEP 4: Print the results

  if (!error) {
      return result.results.channels[0].alternatives[0].transcript;
  };
};

AWS.config.update({
  accessKeyId: 'AKIAU5FA3AS4N3SGVO6F',
  secretAccessKey: '0Uo18kboBtarVYXR3qciKeRfiTEDDt5fN8aQtyle',
  region: 'us-east-1', // Change to your region
});

 
////////////////////////////////////////////////////////////////////////////
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, }).then(() => { console.log('Connected Succesfully.') }).catch((err) => console.log('no connection ', err))
const server = app.listen(PORT, () => console.log("Listening on port ", PORT));    