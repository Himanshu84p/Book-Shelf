
document.getElementById("payButton").addEventListener("click", async () => {
  const amount = document.getElementById("amount").value;
  const cartInput = document.getElementById("cart");
  const cartData = await JSON.parse(cartInput.value);
  const books = cartData.books;

  // Make an API request to create a new order
  const response = await fetch("/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      books,
      cartData,
    }),
  });

  const order = await response.json();

  // Initiate Razorpay Checkout
  const options = {
    key: "rzp_test_Ii9ug87D0WT3Wt",
    amount: order.amount,
    currency: "INR", // Change to preferred currency
    name: "BOOKSHELF",
    description: "Payment for Books",
    order_id: order.id,
    theme: {
      color: "#3399cc", // Customize the color of the checkout form
    },
    handler: async (response) => {
      // Send the payment ID to your server for verification
      const paymentId = response.razorpay_payment_id;
      const orderId = order.id;

      // Make an API request to confirm payment success
      const paymentSuccessResponse = await fetch("/payment-success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          orderId,
        }),
      });

      const paymentSuccessData = await paymentSuccessResponse.json();
      if (paymentSuccessData.status === "success") {
        window.location.href = "/orders"; // Handle success as needed
      } else {
        alert("Payment failed!"); // Handle failure as needed
      }
    },
  };

  const rzp = new Razorpay(options);
  rzp.open();
});
