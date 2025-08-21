import User from "../models/userModel.js"
import bcrypt from "bcryptjs";
import { hashPassword, comparePassword } from "../helpers/passwordHelper.js";
import { generateToken } from "../helpers/tokenHelper.js";


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
      const { name, email, password } = req.body;
  
      // check if email exists
      const existing = await User.findByEmail(email);
      if (existing) return res.status(400).json({ message: "Email already exists" });
  
      // hash password
      const hashed = await hashPassword(password);
  
      const user = await User.create({ name, email, password: hashed });
  
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };
  
  export const loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findByEmail(email);
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
  
      const match = await comparePassword(password, user.password);
      if (!match) return res.status(400).json({ message: "Invalid credentials" });
  
      const token = generateToken(user.id);
  
      res.json({ id: user.id, name: user.name, email: user.email, token });
    } catch (err) {
      next(err);
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
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  };
  