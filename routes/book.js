const express = require("express");
const router = express.Router();
const Book = require("../models/book.js");

router.get("/search", async (req, res) => {
  const query = req.query.query; // Get the search query from the request

  const allBooks = await Book.find({});

  console.log(allBooks);
  if (allBooks) {
    // Implement logic to filter books based on the search query
    const filteredBooks = allBooks.filter((book) => {
      return (
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.genre.toLowerCase().includes(query.toLowerCase())
      );
    });
    const itemsPerPage = 8;
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const booksOnPage = filteredBooks.slice(startIndex, endIndex);

    // Render the search results using an EJS template
    res.render("listings/books.ejs", {
      query: query,
      booksOnPage: booksOnPage,
      currentPage: page,
      totalPages: totalPages,
    });
  } else {
    res.redirect("/books");
  }
});

module.exports = router;
