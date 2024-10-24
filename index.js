const express = require("express");
const UserRoute=require("./routes/UserRoute")
const TodoRoute=require("./routes/TodoRoute")
require('dotenv').config();

const mongoose = require("mongoose");
const app = express();
app.use(express.json());


const ConnectToMongo=async()=>{
    try{
        await mongoose.connect("mongodb+srv://palvaiuser:arjunchay123@cluster0.eqkdy.mongodb.net/");
        console.log("mongoose is connected")
    }catch(errr){
        console.log("mongoose is not connected",errr)
    }
}
ConnectToMongo()



app.get("/healthy",(req,res)=>{
    return res.status(200).send("this is healthy kindey")
    
})


app.use("/",TodoRoute)
app.use("/",UserRoute)





app.listen(3000,()=>{
    console.log("the server is started")
});