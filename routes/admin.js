const express = require("express");
const multer = require("multer");
const CryptoJS = require("crypto-js");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const storage = require("../utils/multerConfig");
const authenticate = require("../middlewares/auth");

// Create the Multer upload middleware
const upload = multer({ storage: storage });

/**
 * Route handler for the admin dashboard.
 * Retrieves posts for the current page and renders the admin dashboard template.
 * Requires authentication using the "authenticate" middleware.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const page = req.query.page || 1; // Get the page number from the query string or default to 1
    const limit = 10; // Number of posts to display per page
    const skip = (page - 1) * limit; // Calculate the number of posts to skip

    const totalPosts = await Post.countDocuments(); // Get the total number of posts
    const totalPages = Math.ceil(totalPosts / limit); // Calculate the total number of pages

    const posts = await Post.find({ author: req.user })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(); // Fetch the posts for the current page

    res.render("admin/dashboard", {
      title: "Admin - Devblog",
      posts,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error); // Handle error
  }
});

/**
 * Route handler for the add new post page.
 * Renders the admin add template.
 * Requires authentication using the "authenticate" middleware.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
router.get("/add", authenticate, (req, res, next) => {
  res.render("admin/add", { title: "Add New Post" });
});

/**
 * Route handler for adding a new post.
 * Saves the new post to the database and redirects to the admin dashboard.
 * Requires authentication using the "authenticate" middleware.
 * Uses the "multer upload" middleware to handle file uploads.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
router.post(
  "/add",
  authenticate,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { title, subtitle, content } = req.body; //get title,subtitle,content from request body
      const { filename } = req.file; //get filename
      const author = req.user; //get author
      //create slug
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      const newPost = new Post({
        title,
        subtitle,
        content,
        author,
        slug,
        image: `/images/${filename}`,
      });

      const savedPost = await newPost.save(); //save post
      res.redirect("/admin/"); //redirect to admin panel
    } catch (error) {
      next(error); //handle error
    }
  }
);

/**
 * Route handler for deleting a post.
 * Deletes a post from the database based on the provided post ID and redirects to the admin dashboard.
 * Requires authentication using the "authenticate" middleware.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
router.get("/delete/:id", authenticate, async (req, res, next) => {
  const { id } = req.params; //get id from params

  try {
    const deletedPost = await Post.findByIdAndDelete(id); //delete post

    if (!deletedPost) {
      return res.status(404).send("Post not found");
    }

    return res.redirect("/admin/"); //redirect to admin panel
  } catch (error) {
    next(error); //handle error
  }
});

/**
 * Route handler for editing a post.
 * Retrieves a post from the database based on the provided post ID and renders the admin edit template.
 * Requires authentication using the "authenticate" middleware.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
router.get("/edit/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params; //get id from params
    const post = await Post.findOne({ _id: id }); //find post from database
    res.render("admin/edit", { title: "Edit Post", post }); //render template with post
  } catch (e) {
    next(e); //handle error
  }
});

/**
 * Route handler for updating a post.
 * Updates a post in the database based on the provided post ID and form data, then redirects to the admin dashboard.
 * Requires authentication using the "authenticate" middleware.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
router.post("/edit/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params; //get id from params
    const { title, subtitle, content } = req.body; //get title,subtitle,content from request body

    // Construct the updatedData object based on the form fields
    const updatedData = {
      title: title,
      subtitle: subtitle,
      content: content,
    };

    // Use the findByIdAndUpdate method with the update data and options
    const updatedPost = await Post.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    // Redirect to the appropriate route
    res.redirect("/admin/");
  } catch (e) {
    next(e);
  }
});
/**
 * Route handler for the login page.
 * Renders the admin login template.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
router.get("/login", (req, res, next) => {
  res.render("admin/login", { title: "Admin Login" });
});

/**
 * Route handler for the login form submission.
 * Authenticates the user based on the provided email and password.
 * If authentication is successful, sets a user cookie and redirects to the admin page.
 * If authentication fails, renders the login template with an error message.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("admin/login", {
        title: "Admin Login",
        error: "Invalid email or password",
      });
    }

    const hashedPassword = CryptoJS.SHA256(password).toString();
    const isPasswordValid = user.password === hashedPassword;

    if (!isPasswordValid) {
      return res.render("admin/login", {
        title: "Admin Login",
        error: "Invalid email or password",
      });
    }

    res.cookie("user", user.name, { httpOnly: true });

    res.redirect("/admin/");
  } catch (e) {
    next(e);
  }
});
/**
 * Route handler for logging out.
 * Deletes the HTTP-only "user" cookie and redirects to the admin panel.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {void}
 */
router.get("/logout", (req, res) => {
  res.clearCookie("user"); //clear coockie
  res.redirect("/admin/login"); //redirect to login page
});

module.exports = router;
