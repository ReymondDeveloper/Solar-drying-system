import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import supabase from "../../database/supabase.db.js";
import jwt from "jsonwebtoken";
import axios from "axios";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, limit, offset, search, date_from, date_to } = req.query;
    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (typeof limit !== "undefined" && typeof offset !== "undefined") {
      const start = Number(offset);
      const end = start + Number(limit) - 1;
      query = query.range(start, end);
    }

    if (typeof role !== "undefined" && role !== "all") {
      query = query.eq("role", role.toLowerCase());
    }

    if (typeof search !== "undefined" && search) {
      query = query.or(`name.ilike.%${search}%`);
    }

    if (typeof date_from !== "undefined" && date_from) {
      const fromDate = `${date_from}T00:00:00Z`;
      query = query.gte("created_at", fromDate);
    }

    if (typeof date_to !== "undefined" && date_to) {
      const toDate = `${date_to}T23:59:59.999Z`;
      query = query.lte("created_at", toDate);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({ data, totalCount: count });
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
    const { full_name, role, address } = req.body;
    let user_id;

    if (role === "farmer") {
      const { data, error } = await supabase
        .from("users")
        .select("user_id")
        .ilike("user_id", "FRS%")
        .order("user_id", { ascending: false })
        .limit(1)
        .maybeSingle(); // allows 0 rows

      const lastId = data?.user_id;

      if (!lastId) {
        user_id = "FRS9000";
      } else {
        const match = lastId.match(/^FRS(\d+)$/);
        const num = match ? parseInt(match[1], 10) + 1 : 9000;
        user_id = `FRS${num}`;
      }
    } else if (role === "owner") {
      const { data, error } = await supabase
        .from("users")
        .select("user_id")
        .ilike("user_id", "OR%")
        .order("user_id", { ascending: false })
        .limit(1)
        .maybeSingle(); // allows 0 rows

      const lastId = data?.user_id;

      if (!lastId) {
        user_id = "OR1100100";
      } else {
        // FIX: use OR here, not FRS
        const match = lastId.match(/^OR(\d+)$/);
        const num = match ? parseInt(match[1], 10) + 1 : 1100100;
        user_id = `OR${num}`;
      }
    }

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: full_name,
          role,
          address,
          user_id,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({ message: "Registration failed." });
    }

    res.status(201).json({
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      message: `Registered successfully. ID: ${data.user_id}.`,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.body;
    const { data, error } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", user_id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "User not found." });
    }

    const { error: deleteError } = await supabase
      .from("users")
      .update({ deleted_at: new Date() })
      .eq("user_id", user_id);

    if (deleteError) throw deleteError;

    res.json({ message: "Account deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { name, user_id, password } = req.body;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user_id)
      .eq("name", name)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (!data)
      return res.status(404).json({ message: "User ID doesn’t exist." });
    if (data.delete_at)
      return res.status(404).json({ message: "User ID doesn’t exist." });

    if (!data.password) {
      return res.status(200).json({
        message: "User ID isn't activated yet.",
      });
    }

    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password." });

    const token = generateToken(data.id);
    if (!token)
      return res.status(401).json({ message: "Token is not working." });

    res.json({
      message: "Login successful",
      user: {
        id: data.id,
        name: data.name,
        role: data.role,
        address: data.address,
        profile_image: data.profile_image,
        mobile_number: data.mobile_number,
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
    const { name, address, mobile_number } = req.body;

    let profileImage = null;

    if (req.file) {
      profileImage = `${
        process.env.BASE_URL || "http://localhost:3000"
      }/uploads/${req.file.filename}`;
    }

    const updateData = {
      name,
      address,
      mobile_number,
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

export const findUser = async (req, res, next) => {
  try {
    const { name, user_id } = req.query;

    const { data, error } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", user_id)
      .eq("name", name)
      .is("deleted_at", null)
      .is("password", null)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    res.json({ user_id: data });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { user_id, password } = req.body;
    const newPassword = await bcrypt.hash(password, 10);
    const { error } = await supabase
      .from("users")
      .update({ password: newPassword })
      .eq("user_id", user_id);

    if (error && error.code !== "PGRST116") throw error;

    res.status(200).json({
      message: "You've successfully activated your account.",
    });
  } catch (err) {
    next(err);
  }
};
