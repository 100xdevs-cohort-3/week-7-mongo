const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const User= new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    lowercase: true,  // Ensures email is stored in lowercase
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],  // RegExp for email validation
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],  // Minimum length
    validate: {
      validator: function(v) {
        return /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{6,}$/.test(v);
      },
      message: 'Password must contain at least one letter, one number, and one special character',
    }
  }
}, { timestamps: true });


const Todo = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: String,
    done:{
        type: Boolean,
        default: false
    },
    createdAt: {
      type: Date,
      default: Date.now },

    dueDate: {
      type: Date,
      required: false  
    }
},{timestamps:true});

User.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


User.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}

const UserModel = mongoose.model('users', User);
const TodoModel = mongoose.model('todos', Todo);

module.exports = {
    UserModel,
    TodoModel
}