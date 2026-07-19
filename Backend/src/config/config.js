import dotenv from "dotenv";
dotenv.config()

const required_key = ["MONGO_URI", "PORT", "JWT_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "IMAGEKIT_PRIVATE_KEY"]

required_key.forEach((key)=>{
    if(!process.env[key]){
        throw new Error(`${key} is missing in .env`)
    }
})

const config = {
    MONGO_URI : process.env.MONGO_URI,
    PORT : process.env.PORT,
    JWT_SECRET : process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET,
    IMAGEKIT_PRIVATE_KEY : process.env.IMAGEKIT_PRIVATE_KEY
}

export default config

