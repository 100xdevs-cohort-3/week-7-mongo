const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const TodoSchema = new Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ensure this matches the model name
      required: true
    },
    title: { type: String, required: true },
    done: { type: Boolean, default: false }, // Default to false
    created_on: { type: Date, default: Date.now },
    due_by: { type: Date }
  });

  module.exports=mongoose.model("Todo",TodoSchema)