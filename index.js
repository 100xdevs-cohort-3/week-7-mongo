const express = require("express");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const env = require("dotenv")
env.config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

const app = express();
app.use(express.json());

const UserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string()
});

const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const TodoSchema = z.object({
    title: z.string(),
    done: z.boolean(),
    dueDate: z.string().datetime().optional()
});

const UpdateTodoSchema = z.object({
    done: z.boolean()
});

app.post("/signup", async function (req, res) {
    try {
        const { email, password, name } = UserSchema.parse(req.body);

        const user = new UserModel({
            email,
            password,
            name
        });

        await user.save();

        res.json({ message: "You are signed up" });
    } catch (error) {
        if (error) {
            return res.status(400).json({ message: "Invalid input", errors: error.message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

app.post("/signin", async function (req, res) {
    try {
        const { email, password } = SignInSchema.parse(req.body);

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);

        res.json({ token });
    } catch (error) {
        if (error ) {
            return res.status(400).json({ message: "Invalid input", errors: error.message });
        }
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

app.post("/todo", auth, async function (req, res) {
    try {
        const userId = req.userId;
        const { title, done, dueDate } = TodoSchema.parse(req.body);

        const todo = await TodoModel.create({
            userId,
            title,
            done,
            dueDate: dueDate ? new Date(dueDate) : undefined
        });

        res.json({ message: "Todo created", todo });
    } catch (error) {
        if (error) {
            return res.status(400).json({ message: "Invalid input", errors: error.errors });
        }
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

app.get("/todos", auth, async function (req, res) {
    try {
        const userId = req.userId;

        const todos = await TodoModel.find({ userId });

        res.json({ todos });
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

app.put("/todo/:id", auth, async function (req, res) {
    try {
        const todoId = req.params.id;
        const { done } = UpdateTodoSchema.parse(req.body);

        const todo = await TodoModel.findOneAndUpdate(
            { _id: todoId, userId: req.userId },
            { done },
            { new: true }
        );

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json({ message: "Todo updated", todo });
    } catch (error) {
        if (error) {
            return res.status(400).json({ message: "Invalid input", errors: error.message });
        }
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

app.use((req, res) => {
    res.send("may be wrong route/method")
})

app.listen(3000, () => console.log("Server running on port 3000"));

