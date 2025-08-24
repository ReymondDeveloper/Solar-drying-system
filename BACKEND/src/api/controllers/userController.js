import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import supabase from "../../database/supabase.db.js";
import { sendOtpEmail } from "../helpers/sendOtpEmail.js"; 

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { first_name, middle_name, last_name, email, password, is_admin, is_farmer, is_owner } = req.body;
    
    const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
 

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    // const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();  
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
         is_admin: is_admin || false,
         is_farmer: is_farmer || false,
         is_owner: is_owner || false,
         is_verified: false,
         otp_code: otp,
         otp_expires_at: expiresAt,
       },
     ])
     .select()
     .single();  

    if (error || !data) {
      return res.status(400).json({ message: "User not found" });
    } 
      
    await sendOtpEmail(email, otp);
    console.log(`📩 OTP sent to ${email}: ${otp}`);
    console.log("Server now:", new Date());
    console.log("OTP expires at:", expiresAt);
    
    const { password: _p, otp_code: _otp, otp_expires_at: _exp, ...userSafe } = data;
    res.status(201).json({
      message: "User registered successfully",
      otp, // <-- temporarily for Postman testing
      userSafe: {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      },
    });
    // res.status(201).json({ message: "User registered successfully", user: userSafe });
  } catch (err) {
    res.status(400).json({ error: "Registration failed" });
    next(err);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match?", isMatch);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    console.log("User found:", user?.email, "Hashed password:", user?.password);
    
    
    res.json({
      full_name: [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" "),
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      is_admin: user.is_admin,
      is_farmer: user.is_farmer,
      is_owner: user.is_owner,
      role: user.is_admin ? "admin" : user.is_farmer ? "farmer" : user.is_owner ? "owner" : "user"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ message: "User ID and new password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(id, hashedPassword);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("otp_code, otp_expires_at")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) {
      console.error("❌ OTP verify error:", error);
      return res.status(400).json({ message: "User not found" });
    }

    if (!data.otp_code || !data.otp_expires_at) {
      return res.status(400).json({ message: "No OTP generated" });
    } 

    const now = new Date();
    const expiry = new Date(data.otp_expires_at + 'Z'); 


    console.log("Server now:", now);
    console.log("OTP expires at:", expiry);
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
      return res.status(500).json({ message: "Failed to update user verification" });
    }

    res.json({ message: "OTP verified successfully!" });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
