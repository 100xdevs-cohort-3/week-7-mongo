const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../model/UserModel"); // Adjust the path as needed
const { z } = require("zod");

const router = express.Router();

// Define Zod schemas for validation
const signupSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required")
});

const signinSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

// Signup route
router.post("/signup", async (req, res) => {
    try {
        const { email, password, name } = signupSchema.parse(req.body);
        const existingUser = await UserModel.findOne({ email });
        
        if (existingUser) {
            return res.status(400).send("The email already exists in the database. Please enter a different email.");
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        await UserModel.create({ email, password: hashedPassword, name });

        res.json({ message: "You are signed up" });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ message: error.errors || "Signup failed" });
    }
});

// Signin route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = signinSchema.parse(req.body);
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        const token = jwt.sign({ id: user._id.toString() }, "arjunchay"); // Ensure JWT_SECRET is set in your environment variables

        res.json({ token });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ message: error.errors || "Login failed" });
    }
});

module.exports = router;