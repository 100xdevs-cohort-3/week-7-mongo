const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});


module.exports=mongoose.model("User",UserSchema)