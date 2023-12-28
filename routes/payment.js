const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/order");
const Cart = require("../models/cart");

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  const { amount, currency, books } = req.body;
  console.log(books);

  try {
    const options = {
      amount: amount * 100, // Amount in paisa
      currency,
    };

    const order = await razorpay.orders.create(options);

    // Save order details to the database
    const newOrder = new Order({
      owner: req.user.id,
      orderId: order.id,
      books: books,
      totalAmount: amount,
    });

    await newOrder.save();
    // Render the EJS view with the order details
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/payment-success", async (req, res) => {
  // Handle the payment success callback here
  // Update the order status in your database, send email confirmation, etc.
  const { orderId } = req.body;

  try {
    // Find the order based on the paymentId received from Razorpay
    const order = await Order.findOne({ orderId: orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order status to 'completed' (or any other status you prefer)
    order.status = "completed";
    await order.save();

    // You can perform additional actions here, such as sending email notifications, etc.

    res.json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
