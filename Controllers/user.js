import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModal from "../Model/user.js";
import FineTuneModal from "../Model/FinetuneDetails.js";
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../sendEmail.js'
import rateLimit from 'express-rate-limit';

const secret = 'test';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later.',
  handler: (req, res) => {
    res.status(429).json({ error: "Too many login attempts, please try again later." });
  },
  keyGenerator: (req) => {
    return req.ip; // Use IP address as the key for rate limiting
  },
  store: rateLimit.MemoryStore, // Use MemoryStore for in-memory rate limiting
});

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1h" });

    res.status(200).json({ result: oldUser, token, success: true });

  } catch (err) {
    res.status(500).json({ message: "some went wrong" });
  }
};

export const signup = async (req, res) => {
  console.log(req.body)
  const { email, password, firstname, lastname } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (oldUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }


    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await UserModal.create({ email, password: hashedPassword, firstname, lastname,role: 'user' });

    const token = jwt.sign({ email: result.email, id: result._id }, secret, { expiresIn: "1h" });

    res.status(201).json({ success: true, result, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};

export const email = async (req, res) => {
  console.log(req.body)
  const { email } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (!oldUser) {

    }

    await UserModal.findOne({ email: email })

      .then(user => {
        if (!user) {
          return res.status(400).json({ success: false, message: "error" });
        }

        const token = jwt.sign({ id: user._id }, process.env.jwt_secret_key, { expiresIn: "1m" })

        const send_to = email;
        const sent_from = "jibrandevn@gmail.com";
        const reply_to = "jibrandevn@gmail.com";
        const subjecta = "Reset Password Email";
        const message = ` 
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #333;">Password Reset</h1>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">Hello,</p>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">You have requested to reset your password. Please click the button below to reset your password:</p>
    <p style="text-align: center; margin: 20px 0;">
      <a href="https://velvety-syrniki-62e6b9.netlify.app/reset-new-password/${user._id}/${token}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
    </p>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">If you did not request this change, please ignore this email.</p>
    <div style="margin-top: 20px; font-size: 14px; color: #888;">
      <p>Thank you,</p>
      <p>Your Company Name</p>
    </div>
  </div>
</body>
    `;
        sendEmail(subjecta, message, send_to, sent_from, reply_to);

        res.status(201).json({ success: true, message: "email sent successfully" });
      })
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};

export const restPassword = async (req, res) => {
  const { id, token } = req.params
  const { password } = req.body

  try {
    const oldUser = await UserModal.findOne({ _id: id });

    if (!oldUser) {
      return res.status(400).json({ success: false, message: "Record does not exist" });
    }

    jwt.verify(token, process.env.jwt_secret_key, (err, decoded) => {
      if (err) {
        console.log("error of token");
        return res.status(400).json({ success: false, message: "Error with token" });
      } else {
        bcrypt.hash(password, 10)
          .then(hash => {
            UserModal.findByIdAndUpdate({ _id: id }, { password: hash })
              .then(u => res.send({ Status: "Success" }))
              .catch(err => res.send({ Status: err }))
          })
          .catch(err => res.send({ Status: err }))
      }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};

export const getAllUsers = async ( req,res) => {
  try {
    const users = await UserModal.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletecontact = async (req, res) => {
  const id = req.params.id; // Get the ID from URL parameter
  console.log(id);

  let result = await UserModal.deleteOne({ _id: id });

  if (result.deletedCount === 1) {
    res.send('Deletion successful');
  } else {
    res.status(404).send('User not found');
  }
};

export const get_single_data = async (req, res) => {
  console.log('object');
  const id = req.params.id; // Get the ID from URL parameter

  try {
    const contact = await UserModal.findById(id);

    if (contact) {
      res.status(200).json({ success: true, contact });
    } else {
      res.status(404).json({ success: false, message: 'Contact not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatecontact = async (req, res) => {
  const abc = req.params.id;
  let result = await UserModal.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );

  res.send(abc);
};

function base64ToImage(base64String, filename) {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const currentDir = process.cwd();
  const uploadDir = path.join(currentDir, 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const imagePath = path.join(uploadDir, filename);

  fs.writeFile(imagePath, buffer, err => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Image  saved successfully:', imagePath);
    }
  });

  return imagePath;
}
             
export const addFinetune = async (req, res) => {
  console.log(req.body)
  const { date, time, status, pdf_base64,fileName } = req.body;

  try {
    const imagePath1 = base64ToImage(pdf_base64, fileName);
    const imagePath = `${req.protocol}://${req.get('host')}/uploads/${fileName}`; 
    const result = await FineTuneModal.create({ date, time, status, pdf_base64:imagePath,fileName });
    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};

export const getAllFineTune = async ( req,res) => {
  try {
    const users = await FineTuneModal.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllFineTune1=async (req, res) => {
  const fileName = req.params.fileName;
  const currentDir = process.cwd();
  const uploadDir = path.join(currentDir, 'uploads');
  // const uploadDir = path.join(__dirname, 'uploads'); // Path to your uploads directory

  try {
      const pdfPath = path.join(uploadDir, fileName);
      console.log(pdfPath);
      const pdfData = fs.readFileSync(pdfPath);
      const base64data = Buffer.from(pdfData).toString('base64');
      // console.log(base64data);

      res.json({ base64data }); // Send base64 data to frontend
  } catch (error) {
      console.error('Error downloading PDF:', error);
      res.status(500).json({ message: 'Error downloading PDF' });
  }
};

export const updateFinetune = async (req, res) => {
  const abc = req.params.id;
  let result = await FineTuneModal.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );

  res.send(abc);
};