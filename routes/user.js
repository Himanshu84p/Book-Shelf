const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const Order = require("../models/order.js");

//Signup get and post requests
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res) => {
  let { username, email, password } = req.body;
  const newUser = new User({ username, email });
  try {
    const registeredUser = await User.register(newUser, password);
    req.flash("success", "Registered successfully");
    res.redirect("/books");
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
      res.redirect("/books");
    }
  }
);

//order routes
router.get("/orders", async (req, res) => {
  if (req.user.username != "admin") {
    const ownerId = req.user._id;
    const ownerUsername = req.user.username;
    const allOrders = await Order.find({ owner: ownerId });
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

module.exports = router;
