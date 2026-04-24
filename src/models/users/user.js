import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        lowercase:true,
        unique:true,
    },
    phone:{
        type:Number,
        require: function() { return !this.isGoogle; },
    },
    googleId: { 
        type: String, 
        sparse: true 
    },
    isGoogle: { 
        type: Boolean, 
        default: false 
    },
    password:{
        type:String,
        require: function() { return !this.isGoogle; },
    },
    avatar_url:{
        type:String,
        default:"https://www.svgrepo.com/show/418973/avatar-people-profile.svg",
    },
    city:{
        type:String,
        default:"None"
    },
    bio:{
        type:String,
        default:"None"
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other", "Prefer not to say"],
        default: "Prefer not to say"
    },
    age: {
        type: Number,
        default: null
    },
    occupation: {
        type: String,
        default: "None"
    },
    status: {
        type: String,
        enum: ["Active", "Blocked", "Pending"],
        default: "Pending"
    },
    isOrganizer: {
        type: Boolean,
        default: false
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
        default: null
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
},{
    timestamps:true,
})

const User = mongoose.model('User',userSchema)
export default User