import mongoose from "mongoose";
import config from "./config.js";

export const connectToDB = async()=>{
  try{
    await mongoose.connect(config.MONGO_URI)
    console.log("connected to database")
  }catch(err){
    console.error("MongoDB connnection failed", err)
    process.exit(1)
  }
}