//this file is used to create admin user using CLI

const CryptoJS = require("crypto-js");
const readline = require("readline");

const connectToMongo = require("./utils/db");
const User = require("./models/User");

connectToMongo();

// Readline interface for taking user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to hash password
const hashPassword = (password) => {
  const hashedPassword = CryptoJS.SHA256(password).toString();
  return hashedPassword;
};

// Function to create a new user
const createUser = (name, email, password) => {
  const hashedPassword = hashPassword(password);
  const user = new User({
    name: name,
    email: email,
    password: hashedPassword,
  });

  user
    .save()
    .then(() => {
      console.log("User created successfully!");
      rl.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      rl.close();
      process.exit(0);
    });
};

// Prompt for name, email, and password
rl.question("Enter name: ", function (name) {
  rl.question("Enter email: ", function (email) {
    rl.question("Enter password: ", function (password) {
      createUser(name, email, password);
    });
  });
});
