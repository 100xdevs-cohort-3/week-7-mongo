const express=require("express")
const router=express.Router()
const auth=require("../auth");

const TodoModel=require("../model/TodoModel")

router.post("/todo", auth, async function(req, res) {
    const userId = req.userId;
    // const title = req.body.title;
    // const done = req.body.done;

    const {title,done}=req.body

    await TodoModel.create({
        userId,
        title,
        done
    });

    res.json({
        message: "Todo created"
    })
});


router.get("/todos", auth, async function(req, res) {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    })
});

module.exports=router