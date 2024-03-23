const express = require("express");
const Cart = require("../models/cart");
const { isLoggedIn } = require("../middleware");
const Book = require("../models/book");
const router = express.Router();

//get cart items

router.get("/cart", isLoggedIn, async (req, res) => {
  if (req.user.username != "admin") {
    const ownerId = req.user._id;

    try {
      const cart = await Cart.findOne({ owner: ownerId });
      if (cart && cart.books.length > 0) {
        res.render("listings/cart.ejs", { cart });
      } else {
        res.render("listings/emptycart.ejs");
      }
    } catch (error) {
      res.status(500).send();
    }
  } else {
    res.render("listings/pagenotfound.ejs");
  }
});

//create cart or update it
router.post("/cart", isLoggedIn, async (req, res) => {
  let ownerId = req.user.id;
  let { id } = req.body;

  try {
    let cart = await Cart.findOne({ owner: ownerId });
    let book = await Book.findById(id);

    if (!book) {
      res.status(404).send({ message: "item not found" });
      return;
    }

    const title = book.title;
    const image = book.image;
    const price = book.price;
    const bookId = book.id;
    const author = book.author;
    const quantity = 1;
    //if cart alrady exist for user
    if (cart) {
      const itemIndex = cart.books.findIndex((book) => book.bookId == bookId);

      //check if product exist or not
      if (itemIndex > -1) {
        let product = cart.books[itemIndex];
        product.quantity = product.quantity + 1;

        //calculate the total bill of cart
        cart.bill = cart.books.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);

        //updating the cart after increasing quantity
        cart.books[itemIndex] = product;
        await cart.save();
        res.render("listings/cart.ejs", { cart });
        // return res.status(200).send({ message: "Cart updated" });
      }
      //if book is not present in the cart
      else {
        //pushing book to the array and calculate bill
        cart.books.push({ bookId, title, image, author, price, quantity: 1 });
        cart.bill = cart.books.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);

        await cart.save();
        req.flash("success", "cart updated successfully");
        res.render("listings/cart.ejs", { cart });
        // return res.status(200).send({ message: "book added" });
      }
    } else {
      //no cart exists, create one
      const newCart = await Cart.create({
        owner: ownerId,
        books: [{ bookId, title, image, author, quantity, price }],
        bill: quantity * price,
      });
      cart = await Cart.findOne({ owner: ownerId });
      res.render("listings/cart.ejs", { cart });
      // return res.status(201).send({ message: "cart created" });
    }
  } catch (err) {
    console.log(err);
  }
});

//delete item in cart

router.delete("/cart", isLoggedIn, async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.body;
  try {
    let cart = await Cart.findOne({ owner: ownerId });

    const itemIndex = cart.books.findIndex((book) => book.bookId == id);

    if (itemIndex > -1) {
      let book = cart.books[itemIndex];
      cart.bill -= book.quantity * book.price;
      if (cart.bill < 0) {
        cart.bill = 0;
      }
      cart.books.splice(itemIndex, 1);
      cart.bill = cart.books.reduce((acc, curr) => {
        return acc + curr.quantity * curr.price;
      }, 0);
      cart = await cart.save();

      if (cart.books.length == 0) {
        res.render("listings/emptycart.ejs");
      } else {
        res.render("listings/cart.ejs", { cart });
      }
    } else {
      res.render("listings/emptycart.ejs");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
});

module.exports = router;
