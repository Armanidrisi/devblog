const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");

const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const connectToMongo = require("./utils/db");

const app = express(); //Initialize express app

connectToMongo(); //Database Connection

// view engine setup
app.use(expressLayouts); //ejs layouts
app.set("views", path.join(__dirname, "views")); //views directory
app.set("view engine", "ejs"); //view engine

app.use(logger("dev")); //logger for debuging requests

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());
// Middleware to parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: false }));
// Middleware to parse and handle cookies in incoming requests
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public"))); //static path
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
); //static path for tinymce configuration 

app.use("/", indexRouter); //index routes 
app.use("/admin", adminRouter); //admin routes

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
