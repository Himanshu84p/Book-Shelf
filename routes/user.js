const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");

//Signup get and post requests
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res) => {
  let { username, email, password } = req.body;
  const newUser = new User({ username, email });
  try {
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    res.redirect("/books");
  } catch (error) {
    res.redirect("/signup");
  }
});

//login get and post requests

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    if (req.user.username == "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/books");
    }
  }
);

//logout requests
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;