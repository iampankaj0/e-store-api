import mongoose from "mongoose";

export const connectDB = async () => {
  mongoose.set("strictQuery", false);
  const { connection } = await mongoose.connect(process.env.MONGO_URI, {
    dbName: "E_Store_India",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`DataBase Connected with ${connection.host} `);
};
