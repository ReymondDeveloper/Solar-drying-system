import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import supabase from "../../database/supabase.db.js";
import { sendOtpEmail } from "../helpers/sendOtpEmail.js";
import jwt from "jsonwebtoken";  

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",  
  });
};

export const getUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    let users = await User.findAll();

    if (role) {
      users = users.filter((u) => u.role?.toLowerCase() === role.toLowerCase());
    }

    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ message: "Account doesn’t exist." });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await supabase
      .from("users")
      .update({ otp_code: otp, otp_expires_at: expiresAt })
      .eq("email", email.toLowerCase());

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "New OTP is generated." });
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { first_name, middle_name, last_name, email, password, role, address } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          first_name,
          middle_name,
          last_name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role,
          is_verified: false,
          otp_code: otp,
          otp_expires_at: expiresAt,
          address,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({ message: "Registration failed." });
    }

    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: "Registered successfully. Please verify with OTP.",
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ message: "Account doesn’t exist." });

    if (!user.is_verified) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await supabase
        .from("users")
        .update({ otp_code: otp, otp_expires_at: expiresAt })
        .eq("email", email.toLowerCase());
      await sendOtpEmail(email, otp);
    
      return res.status(200).json({
        message: "Account is not verified. OTP sent again.",
        needVerification: true,
        email,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password." });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        full_name: `${user.last_name}, ${user.first_name} ${user.middle_name}`,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        role: user.role,
        address: user.address,
      },
      token: generateToken(user.id),  
    });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password, email } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ message: "Invalid email address." });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(email, hashedPassword);

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, otp_code, otp_expires_at")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!data.otp_code || !data.otp_expires_at) {
      return res.status(400).json({ message: "No OTP generated" });
    }

    const now = new Date();
    const expiry = new Date(data.otp_expires_at + "Z");

    if (data.otp_code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (now > expiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ otp_code: null, otp_expires_at: null, is_verified: true })
      .eq("email", email.toLowerCase());

    if (updateError) {
      return res.status(500).json({ message: "Failed to verify account" });
    }

    const token = generateToken(data.id);

    res.json({ message: "Account verified successfully!", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;  
    const { first_name, middle_name, last_name, mobile_number, email } = req.body;

    let profileImage = null;

    if (req.file) {
      profileImage = `${process.env.BASE_URL || "http://localhost:3000"}/uploads/${req.file.filename}`;
    }

    const updateData = {
      first_name,
      middle_name,
      last_name,
      mobile_number,
      email: email.toLowerCase(),
    };

    if (profileImage) {
      updateData.profile_image = profileImage;
    }

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      console.error(error);
      return res.status(400).json({ message: "Failed to update profile" });
    }

    res.json({ message: "Profile updated successfully", profile_image: profileImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};