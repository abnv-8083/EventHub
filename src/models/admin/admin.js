import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Active", "Blocked", "Pending"],
        default: "Active"
    }
}, {
    timestamps: true,
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
