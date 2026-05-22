const mongoose =require('mongoose');
const bcrypt   = require('bcryptjs');  
const { v4: uuidv4 } = require('uuid'); 

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        trim:true,
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        minlength:6,
        required:true,
    },
    apiKey: {
      type: String,
      unique: true,
      default: uuidv4,     
    }, 
    createdAt: {
      type: Date,
      default: Date.now,
    },
},{timestamps:true,})

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return 
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})
 
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);