const express = require("express");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


const port  = 5000;
const app = express();
app.use(express.json());


app.post("/signup", async function(req, res) {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      message: "Please provide all the details"
    });
  }

  try {

    const existingUser = await UserModel.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const newUser = await UserModel.create({
      email,
      password,
      name
    });


    res.status(201).json({
      message: "You are signed up",
      userId: newUser._id 
    });
  } catch (error) {
    // Catch any unexpected errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

 
    res.status(500).json({
      message: "An internal server error occurred",
      error: error.message
    });
  }
});


app.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email
    });

    if (!user) {
        return res.status(403).json({
            message: "Incorrect creds"
        })
    } 

    const response = user.isPasswordCorrect(password);

    if (response) {
        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_SECRET);

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect creds"
        })
    }
});


app.post("/todo", auth, async function(req, res) {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;

    if(!title) {
        return res.status(400).json({
            message: "Please provide title"
        })
    }

    await TodoModel.create({
        userId,
        title,
        done,
        dueDate
    });

    res.json({
        message: "Todo created"
    })
});


app.get("/todos", auth, async function(req, res) {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    })
});

app.post("/todoFinish/:todoId", auth, async function(req, res) {
    const {todoId }= req.params
    const userId = req.userId;

    const todo = await TodoModel.findOne({
        _id: todoId,
        userId
    });

    if (!todo) {
        return res.status(404).json({
            message: "Todo not found"
        })
    }

   const updatedTodo = await TodoModel.findOneAndUpdate({
        _id: todoId,
        userId
    }, {
        done: true
    });
    if (!updatedTodo) {
        return res.status(404).json({
            message: "Todo not found"
        })
    } 

    res.json({
        message: "Todo marked as done"
    })

});

mongoose.connect("/paste mongobd URI").then(
    app.listen(port, () => {
        console.log(`Server is running at ${port}`);
    })
)
.catch((err) => {
    console.log("MONGO db connection failed", err);
})