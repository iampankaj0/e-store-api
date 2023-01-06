import mongoose from "mongoose";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);
  const { connection } = await mongoose.connect(process.env.MONGO_URI, {
    dbName: "E_Store_India",
  });

  console.log(`DataBase Connected with ${connection.host} `);
};
