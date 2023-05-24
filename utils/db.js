const mongoose = require("mongoose");

//Mongodb Connection
module.exports = connectToMongo = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI
    );
    console.log(`Connection Success`);
  } catch (e) {
    console.log(`Connection Error: ${e}`);
  }
};
