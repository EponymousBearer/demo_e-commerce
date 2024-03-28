import bcrypt from "bcryptjs";
import UserModal from "../Model/user.js";

export const LogIn = async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  try {
    const oldUser = await UserModal.findOne({ email });

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid Credentials" });

    res.status(200).json({ result: oldUser, success: true });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(err);
  }
};

export const Register = async (req, res) => {
  let { email, password, firstname, lastname } = req.body;
  try {
    email = email.toLowerCase();
    const oldUser = await UserModal.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await UserModal.create({ email, password: hashedPassword, firstname, lastname });

    res.status(201).json({ success: true, message: "Sign up successful", newUser });

  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.error(error);
  }
};

export const ForgotPassword = async (req, res) => {
  let { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModal.findOneAndUpdate({ email: email }, { password: hashedPassword });

    res.status(200).json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
    console.error(error);
  }
};

export const MyAccount = async (req, res) => {
  try {
    const { email } = req.params; 
    const lowercaseEmail = email.toLowerCase(); 
    const userDetails = await UserModal.findOne({ email: lowercaseEmail }); 
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User details not found" });
    }

    res.status(200).json({ success: true, user: userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export const getalluser = async (req, res) => {
 
  try {
 
    const userDetails = await UserModal.find();
 
    res.status(200).json({ success: true, user: userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
