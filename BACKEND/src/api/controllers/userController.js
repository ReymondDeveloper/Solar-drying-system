import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import supabase from "../../database/supabase.db.js";
import { sendOtpEmail } from "../helpers/sendOtpEmail.js";
import jwt from "jsonwebtoken";
import axios from "axios";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

export const getUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    const sort = req.query.sort || "desc";

    let query = supabase.from("users").select("*");

    if (role && role !== "all") {
      query = query.eq("role", role.toLowerCase());
    }

    query = query.order("created_at", { ascending: sort !== "desc" });

    const { data: users, error } = await query;
    if (error) throw error;

    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user)
      return res.status(404).json({ message: "Account doesn’t exist." });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const date = new Date();
    date.setMinutes(date.getMinutes() + 5);
    const expiresAt = date.toString();

    await supabase
      .from("users")
      .update({ otp_code: otp, otp_expires_at: expiresAt })
      .eq("email", email);

    const email_data = {
      email,
      otp,
    };
    const params = new URLSearchParams();
    params.append("data", JSON.stringify(email_data));
    await axios.post(
      "https://script.google.com/macros/s/AKfycbxvKYzaJaf7xFMNEENQPyBIGrTex6hquymsFF6dRztAUZqVnMcBxMK-wDPLhGvlSaUKtw/exec",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res
      .status(200)
      .json({ message: "New OTP is generated. Wait shortly for its arrival." });
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      password,
      role,
      address,
    } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const date = new Date();
    date.setMinutes(date.getMinutes() + 5);
    const expiresAt = date.toString();
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

    const email_data = {
      email,
      otp,
    };
    const params = new URLSearchParams();
    params.append("data", JSON.stringify(email_data));
    await axios.post(
      "https://script.google.com/macros/s/AKfycbxvKYzaJaf7xFMNEENQPyBIGrTex6hquymsFF6dRztAUZqVnMcBxMK-wDPLhGvlSaUKtw/exec",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.status(201).json({
      id: data.id,
      email: data.email,
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
    if (!user)
      return res.status(404).json({ message: "Account doesn’t exist." });

    if (!user.is_verified) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const date = new Date();
      date.setMinutes(date.getMinutes() + 5);
      const expiresAt = date.toString();

      await supabase
        .from("users")
        .update({ otp_code: otp, otp_expires_at: expiresAt })
        .eq("email", user.email);

      const email_data = {
        email,
        otp,
      };
      const params = new URLSearchParams();
      params.append("data", JSON.stringify(email_data));
      await axios.post(
        "https://script.google.com/macros/s/AKfycbxvKYzaJaf7xFMNEENQPyBIGrTex6hquymsFF6dRztAUZqVnMcBxMK-wDPLhGvlSaUKtw/exec",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return res.status(200).json({
        message: "Account is not yet verified.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password." });

    const token = generateToken(user.id);
    if (!token)
      return res.status(401).json({ message: "Token is not working." });

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
        email: user.email,
        profile_image: user.profile_image,
        mobile_number: user.mobile_number,
      },
      token: token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password, email } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findByEmail(email);
    if (!user)
      return res.status(404).json({ message: "Invalid email address." });

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
    const { data: user, error } = await supabase
      .from("users")
      .select("id, otp_code, otp_expires_at")
      .eq("email", email)
      .single();

    if (!user || error) {
      console.log("Email:" + email);
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otp_code || !user.otp_expires_at) {
      console.error(user);
      return res.status(400).json({ message: "No OTP generated" });
    }

    const expiry = user.otp_expires_at;
    const now = new Date().toString();

    if (user.otp_code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (now > expiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await supabase
      .from("users")
      .update({ otp_code: null, otp_expires_at: null, is_verified: true })
      .eq("email", email);

    res.status(200).json({ message: "Account verified successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, middle_name, last_name, mobile_number, email } =
      req.body;

    let profileImage = null;

    if (req.file) {
      profileImage = `${
        process.env.BASE_URL || "http://localhost:3000"
      }/uploads/${req.file.filename}`;
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

    res.json({
      message: "Profile updated successfully",
      profile_image: profileImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
