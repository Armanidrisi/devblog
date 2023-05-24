const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

/**
 * Route handler for the home page.
 * Retrieves posts for the current page and renders the index template.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
router.get("/", async (req, res, next) => {
  try {
    const page = req.query.page || 1; // Get the page number from the query string
    const limit = 10; // Number of posts to display per page
    const skip = (page - 1) * limit; // Calculate the number of posts to skip

    const totalPosts = await Post.countDocuments(); // Get the total number of posts
    const totalPages = Math.ceil(totalPosts / limit); // Calculate the total number of pages

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(); // Fetch the posts for the current page

    res.render("index", {
      title: "Home - Devblog",
      posts,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error); //handle error
  }
});
/**
 * Route handler for displaying a specific post.
 * Retrieves a post from the database based on the provided slug and renders the post template.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
router.get("/post/:slug", async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }); //Find post from database
    if (!post) {
      // Handle case when post is not found
      return res.status(404).send("Post not found");
    }

    res.render("post", { post, title: post.title });
  } catch (error) {
    next(error); //handle error
  }
});

module.exports = router;
