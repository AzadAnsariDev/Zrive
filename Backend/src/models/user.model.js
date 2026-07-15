import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email : {type: String, required : true, unique : true},
    contact : {type: String, required : true, unique : true},
    username : {type: String, required : true, unique : true},
    password : {type: String, required : true, select : false},
    isSeller : {type : Boolean, required : true, default : false},
    role : {
        type : String,
        enum : ["seller", "buyer"],
        default : "buyer"
    }
})

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password) 
    return isMatch
}

const userModel = mongoose.model("users", userSchema)

export default userModel