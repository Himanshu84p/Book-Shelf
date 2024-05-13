const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
    trim: true, // Trim whitespace from email
    lowercase: true, // Convert email to lowercase
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },
  fullName : {
    type : String,
    required : true,
    trim: true,
  },
  phone : {
    type : Number,
    required : true,
    minlength:10,
    maxlength:10,
    match: [/^\d{10}$/, "Phone number must be 10 digits"]
  },
  address : {
    type : String,
    required : true,
    trim: true,
  }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
