import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModal from "../Model/user.js";
import FineTuneModal from "../Model/FinetuneDetails.js";
import Session from "../Model/Session.js";
import UserSession from "../Model/UserSession.js";
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../sendEmail.js'
import rateLimit from 'express-rate-limit';
import { MongoClient, ObjectId } from 'mongodb';
import multer from 'multer';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: 'AKIAU5FA3AS4N3SGVO6F',
  secretAccessKey: '0Uo18kboBtarVYXR3qciKeRfiTEDDt5fN8aQtyle',
  region: 'us-east-1', // Change to your region
});

// Create an instance of the Polly SDK
const polly = new AWS.Polly();

export const signin = async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  try {
    password = `${password}a`;
    console.log(password);
    const oldUser = await UserModal.findOne({ email });

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });
 
    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, process.env.jwt_secret_key, { expiresIn: "1h" });
    const existingSession = await UserSession.findOne({ id: oldUser._id });
    if (existingSession) {
      return res.status(403).json({ error: 'User already logged in' });
    }
  
    // Create a new session
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24); // 24 hours from now
    // expirationTime.setMinutes(expirationTime.getMinutes() + 3); 
    const session = new UserSession({ id: oldUser._id, expiresAt: expirationTime });
    await session.save();
 
    res.status(200).json({ result: oldUser, token, success: true });

  } catch (err) {
    res.status(500).json({ message: "some went wrong" });
  }
};

export const Logout = async (req, res) => {
  console.log(req.params.id);
    const userId = req.params.id; // Assuming you have authentication middleware
    await UserSession.deleteOne({ id:userId });
    res.json({ message: 'Logout successful' });
}

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

        const token = jwt.sign({ id: user._id }, process.env.jwt_secret_key, { expiresIn: "1h" })

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


export const VerifyUser = async (req, res) => {
  const token = req.params.token;
  console.log(token);

  try {
    // Verify JWT token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.jwt_secret_key, async (err, decoded) => {
        if (err) {
          console.error('Token verification failed:', err.message);
          // Send response indicating token expiration
          return res.status(401).json({ message: 'Token Expired' });
        }
        else {
          console.log('Token verified successfully:', decoded);
          try {
            const contact = await UserModal.findById(decoded.id);
            if (contact) {

              contact.status = "approved";
              await contact.save();
              return res.status(200).json({ message: 'User approved successfully' });

            } else {
              return res.status(404).json({ message: 'User not found' });
            }
          } catch (error) {
            console.error('Error while finding user:', error.message);
            return res.status(500).send('Internal Server Error');
          }
        }
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).send('Internal Server Error');
  }
};

export const VerifyUseronAllPages = async (req, res) => {
  const token = req.params.token;
  const id = req.params.id;
  console.log(token);
  console.log(id);

  try {
    // Verify JWT token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.jwt_secret_key, async (err, decoded) => {
        if (err) {
          console.error('Token verification failed:', err.message);
          // Send response indicating token expiration
          return res.status(401).json({ message: 'Token Expired' });
        }
        else {
          console.log('Token verified successfully:', decoded);
          try {
            console.log(decoded.id);
            const contact = await UserModal.findById(decoded.id);
            const contact1 = await UserSession.findOne({id:id});
            if (contact && decoded.id===id &&contact1) {
              if (contact.status == 'approved') {
                if (contact.role == 'admin') {
                  return res.status(201).json({ message: 'User is Admin' });
                }
                else {
                  return res.status(200).json({ message: 'User is not Admin' });

                }
              }

            } else {
              return res.status(404).json({ message: 'error' });
            }
          } catch (error) {
            console.error('Error while finding user:', error.message);
            return res.status(500).send('Internal Server Error');
          }
        }
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).send('Internal Server Error');
  }
};

//signup
export const VerifyEmail = async (req, res) => {

  console.log(req.body)
  let { email, password, firstname, lastname } = req.body;
  try {

    email = email.toLowerCase();
    const oldUser = await UserModal.findOne({ email });


    if (oldUser) {
      // Check if user status is 'pending'
      if (oldUser.status === 'pending') {
        // Delete the user
        await UserModal.deleteOne({ _id: oldUser._id });
      }
      else {
        return res.status(400).json({ success: false, message: "User already exists" });

      }
    }
    password = `${password}a`;

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await UserModal.create({ email, password: hashedPassword, firstname, lastname, role: 'user', status: "pending" });


    const token = jwt.sign({ id: result._id }, process.env.jwt_secret_key, { expiresIn: "30m" });

    const send_to = email;
    const sent_from = "jibrandevn@gmail.com";
    const reply_to = "jibrandevn@gmail.com";
    const subjecta = "Email Confirmation Email";
    const message = `
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333;">Password Reset</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Hello,</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">You have requested to Register. Please click the button below to Verify Your Email:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="http://localhost:5173/VerifyEmail/${token}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify</a>
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

export const getAllUsers = async (req, res) => {
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
  const { date, time, status, pdf_base64, fileName, id } = req.body;

  try {
    let newFileName = fileName;
    let count = 1;

    // Check if a document with the same file name already exists
    let existingDocument = await FineTuneModal.findOne({ fileName: newFileName });

    // If a document with the same name exists, add a number to the end of the file name
    while (existingDocument) {
      newFileName = `${fileName.replace(/\.[^/.]+$/, '')}_${count}.${fileName.split('.').pop()}`;
      existingDocument = await FineTuneModal.findOne({ fileName: newFileName });
      count++;
    }

    // Save the document with the new file name
    const imagePath1 = base64ToImage(pdf_base64, newFileName);
    const imagePath = `${req.protocol}://${req.get('host')}/uploads/${newFileName}`;

    const result = await FineTuneModal.create({ date, time, status, pdf_base64: imagePath, fileName: newFileName, id });
    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};

export const getAllFineTune = async (req, res) => {
  try {
    const users = await FineTuneModal.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllFineTune1 = async (req, res) => {
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
  console.log(abc);
  // let result = await FineTuneModal.updateOne(
  //   { _id: req.params.id },
  //   { $set: req.body }
  // );

  // res.send(abc);
};

export const fromahmed = async (req, res) => {
  const abc = req.body;
  console.log(abc);

  try {
    const send_to = 'jibrandevn@gmail.com';
    const sent_from = "jibrandevn@gmail.com";
    const reply_to = "jibrandevn@gmail.com";
    const subjecta = "Reset Password Email";
    const message = `
      
          <pre>${JSON.stringify(abc, null, 2)}</pre> <!-- Stringify and format JSON -->
       
    `;
    sendEmail(subjecta, message, send_to, sent_from, reply_to);

    res.status(201).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getAllFineTune_Ids = async (req, res) => {
  const client = new MongoClient('mongodb+srv://jibran:jibranmern@clusterone.u74t8kf.mongodb.net/test?retryWrites=true&w=majority');

  try {
    await client.connect();
    const database = client.db('test');
    const collection = database.collection('document');
    const users = await collection.find({}, { projection: { _id: 1 } }).toArray();
    // Extract only the _id values from the array of objects
    const ids = users.map(user => user._id);

    // Log all IDs

    res.status(200).json(ids);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Close the connection after query is done
    await client.close();
  }
};

export const deleteFineTuneByIds = async (req, res) => {
  const { idsBetween } = req.body;
  console.log(idsBetween);

  if (!idsBetween || !Array.isArray(idsBetween) || idsBetween.length === 0) {
    return res.status(400).json({ message: 'Invalid IDs provided' });
  }

  const client = new MongoClient('mongodb+srv://jibran:jibranmern@clusterone.u74t8kf.mongodb.net/test?retryWrites=true&w=majority');

  try {
    await client.connect();
    const database = client.db('test');
    const collection = database.collection('document');



    for (let id of idsBetween) {
      const objectId = new ObjectId(id);
      // Delete the document with the specified _id
      let result = await collection.deleteOne({ _id: objectId });

      // Check if any document was deleted
      if (result.deletedCount === 1) {
        console.log(`Deleted document with _id: ${id}`);
      } else {
        console.log(`No document found with _id: ${id}`);
      }
    }

    res.status(200).json({ message: 'Deletion successful' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
};

export const deleteFineTuneModal = async (req, res) => {
  const id = req.params.id; // Get the ID from URL parameter
  console.log(id);

  try {
    // Find the document to get the file name
    const document = await FineTuneModal.findById(id);
    if (!document) {
      return res.status(404).send('Document not found');
    }

    // Get the file name from the document
    const fileName = document.fileName;

    // Delete the document from the database
    let result = await FineTuneModal.deleteOne({ _id: id });

    if (result.deletedCount === 1) {
      // Delete the file from the uploads directory
      const currentDir = process.cwd();
      const uploadDir = path.join(currentDir, 'uploads');

      const filePath = path.join(uploadDir, fileName);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully');
        }
      });

      res.send('Deletion successful');
    } else {
      res.status(404).send('Document not found');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
};

export const textToSpeech = async (req, res) => {
  const { text } = req.body;

  const params = {
    OutputFormat: 'mp3', // Change output format if needed
    Text: text,
    VoiceId: 'Joey',

    // Change to desired voice
  };

  try {
    const data = await polly.synthesizeSpeech(params).promise();

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': data.AudioStream.length,
    });

    res.send(data.AudioStream);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error synthesizing speech');
  }
}

//sessions
export const addSession = async (req, res) => {
  const { date, time, userid, messages } = req.body;

  try {
    const result = await FineTuneModal.create({ date, time, userid, messages });
    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.log(error);
  }
};

export const get_single_session = async (req, res) => {
  console.log('objdsdasdasdect');
  const id = req.params.id; // Get the ID from URL parameter

  try {
    const contact = await Session.find({ userid: id });

    if (contact) {
      res.status(200).json({ success: true, contact });
    } else {
      res.status(404).json({ success: false, message: 'Contact not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addMessageInSession = async (req, res) => {
  const { sessionid } = req.params.id;
  const { userid } = req.params.id;
  const { role, message } = req.body;

  try {
    const session = await Session.findOne({ _id: sessionid, userid: userid });

    if (!session) {
      return res.status(404).json({ message: 'Session not found or unauthorized' });
    }

    // Add the new message to the session
    session.messages.push({ role, message });
    await session.save();

    res.status(201).json({ message: 'Message added to session successfully' });
  } catch (error) {
    console.error('Error adding message to session:', error);
    res.status(500).json({ message: 'Server error' });
  }
}



