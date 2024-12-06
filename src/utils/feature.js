import mongoose from "mongoose";

const connectDB = (uri) => {
  mongoose.connect(uri, {
    dbName: "DTS",
  })
  .then((connection) => {
    console.log(`Connected DB to ${connection.connection.host}`);
  })
  .catch((error) => {
    console.log(error);
  });
};

// module.exports = { connectDB };
export default connectDB;
