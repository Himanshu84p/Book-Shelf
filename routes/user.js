const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const Order = require("../models/order.js");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

//Signup get and post requests
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res) => {
  let { username, email, fullName, address, phone, password } = req.body;
  try {
    const signupFormData = req.flash("signupFormData", {
      username,
      email,
      fullName,
      address,
      phone,
      password,
    });

    // Validate input fields
    if (!username || !email || !fullName || !address || !phone || !password) {
      console.log("1");
      req.flash("error", "All fields are required");
      return res.redirect("/signup",signupFormData);
    }

    //min length
    if (username.length < 6) {
      req.flash("error", "Username should be min 6 length");
      console.log("2");
      return res.redirect("/signup",signupFormData);
    }

    // Validate email
    if (!emailRegex.test(email)) {
      console.log("checking email");
      console.log("3");
      req.flash("error", "Enter valid email address");
      return res.redirect("/signup",signupFormData);
    }

    // Validate phone number format
    if (!phoneRegex.test(phone)) {
      console.log("4");
      req.flash("error", "Phone number must be 10 digits and valid");
      return res.redirect("/signup",signupFormData);
    }

    // Validate phone number format
    if (!passwordRegex.test(password)) {
      console.log("5");
      req.flash("error", "Password should be in format");
      return res.redirect("/signup",signupFormData);
    }

    const newUser = new User({ username, email, fullName, address, phone });

    const registeredUser = await User.register(newUser, password);
    req.flash("success", "Registered successfully Login to access account");
    res.redirect("/login");
  } catch (error) {
    req.flash("error", "Username already exist");
    res.redirect("/signup");
  }
});

//login get and post requests

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    if (req.user.username == "admin") {
      req.flash("success", "Admin Login successfully");
      res.redirect("/admin");
    } else {
      req.flash("success", "Login successfully");
      res.redirect("/");
    }
  }
);

//order routes
router.get("/orders", async (req, res) => {
  if (req.user.username != "admin") {
    const ownerId = req.user._id;
    const ownerUsername = req.user.username;
    const allOrders = await Order.find({ owner: ownerId }).sort({
      updatedAt: -1,
    });
    res.render("listings/orders.ejs", { allOrders, ownerUsername });
  } else {
    res.render("listings/pagenotfound.ejs");
  }
});

//logout requests
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logout successfully");
    res.redirect("/login");
  });
});

//edit request
router.get("/edit", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log("Current user is ", user);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/login");
    }
    res.render("users/edit.ejs", { user });
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    res.redirect("/edit");
  }
});

router.put("/edit", async (req, res) => {
  try {
    const {
      username,
      email,
      fullName,
      phone,
      address,
      currentPassword,
      newPassword,
    } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/login");
    }

    if (
      [fullName, email, phone, address, newPassword, currentPassword].some(
        (feild) => feild?.trim() === ""
      )
    ) {
      req.flash("error", "All fields are required");
    }

    user.username = username;
    user.email = email;
    user.fullName = fullName;
    user.phone = phone;
    user.address = address;

    // Validate email
    if (!emailRegex.test(email)) {
      req.flash("error", "Invalid email address");
      return res.redirect("/edit");
    }

    // Validate phone number
    if (!phoneRegex.test(phone)) {
      req.flash("error", "Invalid phone number");
      return res.redirect("/edit");
    }
    if (!passwordRegex.test(password)) {
      req.flash("error", "Password should be in format");
      return res.redirect("/signup");
    }

    if (newPassword) {
      // Check if the current password matches
      if (!(await user.authenticate(currentPassword))) {
        req.flash("error", "Current password is incorrect");
        return res.redirect("/edit");
      }
      // Change password if a new one is provided
      await user.changePassword(currentPassword, newPassword);
    }
    await user.save();
    req.flash("success", "User details updated successfully");
    res.redirect("/books");
  } catch (error) {
    console.error(error);
    req.flash("error", "Error in updating details");
    res.redirect("/edit");
  }
});

module.exports = router;
