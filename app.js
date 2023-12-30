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
const MongoStore = require("connect-mongo");
const userRouter = require("./routes/user.js");
const cartRouter = require("./routes/cart.js");
const adminRouter = require("./routes/admin.js");
const paymentRouter = require("./routes/payment.js");
const ejsMate = require("ejs-mate");
const { isLoggedIn } = require("./middleware.js");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("connect-flash");

// const MONGO_URL = "mongodb://127.0.0.1:27017/bookshelf";

//cloud db link
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.use(bodyParser.json());

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in mongo session store");
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
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
  if (req.user.username != "admin") {
    const allBooks = await Book.find({});
    res.render("listings/books.ejs", { allBooks });
  } else {
    res.render("listings/pagenotfound.ejs");
  }
});

//Show Route
app.get("/books/:id", async (req, res) => {
  if (req.user.username != "admin") {
    let { id } = req.params;
    let book = await Book.findById(id);
    res.render("listings/show.ejs", { book });
  } else {
    res.render("listings/pagenotfound.ejs");
  }
});

app.get("/cart", isLoggedIn, async (req, res) => {
  if (req.user.username != "admin") {
    res.redirect("/books");
  } else {
    res.render("listings/pagenotfound.ejs");
  }
});

app.listen(process.env.PORT, () => {
  console.log("Port is listening on 8080");
});
