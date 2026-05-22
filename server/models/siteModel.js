const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userModel',
        required:true,
    },
    name: {
  type: String,
  default: '',
  trim: true,
},
    domain:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
    subscriberCount: {
        type:Number,
        default:0,
    },
    isActive:{
        type:Boolean,
        default:true,
    }
},{timestamps:true,})


siteSchema.index({ owner: 1, domain: 1 }, { unique: true });
module.exports = new mongoose.model('site',siteSchema);