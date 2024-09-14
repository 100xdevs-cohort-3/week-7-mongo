const express = require("express");
const mongoose = require("mongoose");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });


const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        // Check if email already exists
        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({
            email: email,
            password: hashedPassword,
            name: name
        });

        res.status(201).json({
            message: "You are signed up",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error. Please try again later."
        });
    }
});


app.post("/signin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const foundEmail = await UserModel.findOne({ email: email });

        if (!foundEmail) {
            return res.status(400).json({
                message: "Email not found"
            });
        }

        const matchPassword = await bcrypt.compare(password, foundEmail.password);

        if (!matchPassword) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        if (matchPassword) {
            const token = jwt.sign({
                userId: foundEmail._id.toString()
            }, JWT_SECRET);

            res.json({
                token
            })
        } else {
            res.status(403).json({
                message: "Incorrect credentials"
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


app.post("/todo", auth, async function (req, res) {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    try {
        await TodoModel.create({
            userId,
            title,
            done
        });

        res.json({
            message: "Todo created"
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Mark a todo as done api
app.patch('/todos/:id/done', auth, async (req, res) => {
    const todoId = req.params.id;

    try {
        const updatedTodo = await TodoModel.findByIdAndUpdate(
            todoId,
            { done: true },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({
                message: 'Todo not found'
            });
        }

        res.json({
            message: 'Todo marked as done',
            todo: updatedTodo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Endpoint to mark a todo as not done (undo)
app.patch('/todos/:id/undone', async (req, res) => {
    const todoId = req.params.id;

    try {
        const updatedTodo = await TodoModel.findByIdAndUpdate(
            todoId,
            { done: false },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({
                message: 'Todo not found'
            });
        }

        res.json({
            message: 'Todo marked as not done',
            todo: updatedTodo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


app.get("/todos", auth, async function (req, res) {
    const userId = req.userId;
    try {
        const todos = await TodoModel.find({ userId });
        res.status(200).json({
            todos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});