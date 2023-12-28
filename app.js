require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Book = require("./models/book.js");
const app = express();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const session = require("express-session");
const userRouter = require("./routes/user.js");
const cartRouter = require("./routes/cart.js");
const adminRouter = require("./routes/admin.js");
const paymentRouter = require("./routes/payment.js");
const ejsMate = require("ejs-mate");
const { isLoggedIn } = require("./middleware.js");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

const MONGO_URL = "mongodb://127.0.0.1:27017/bookshelf";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.use(bodyParser.json());

const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});

app.use("/", userRouter);
app.use("/", cartRouter);
app.use("/", adminRouter);
app.use("/", paymentRouter);

//Index Route

app.get("/", (req, res) => {
  res.render("listings/home.ejs");
});
app.get("/books", async (req, res) => {
  const allBooks = await Book.find({});
  res.render("listings/books.ejs", { allBooks });
});

//Show Route
app.get("/books/:id", async (req, res) => {
  let { id } = req.params;
  let book = await Book.findById(id);
  res.render("listings/Show.ejs", { book });
});

app.get("/cart", isLoggedIn, async (req, res) => {
  res.redirect("/books");
});

//demo method for testing purpose
// app.get("/userdemo", async (req, res) => {
//   let fakeUser = new User({
//     email: "123@gmail.com",
//     username: "testUser",
//   });

//   let registeredUser = await User.register(fakeUser, "test");
//   res.send(registeredUser);
// });

// app.get("/book", async (req, res) => {
//   let sampleBook = new Book({
//     title: "Atomic Habits",
//     author: "James Clear",
//     genre: "Self-help",
//     ISBN: "9781847941831",
//     price: 300,
//   });
//   await sampleBook.save();
//   console.log("book was saved");
//   res.send("successfully saved book");
// });

app.listen(process.env.PORT, () => {
  console.log("Port is listening on 8080");
});
