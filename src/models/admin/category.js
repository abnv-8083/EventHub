import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },
    icon: {
        type: String,
        default: "fa-hashtag", // Default FontAwesome icon
    },
    color: {
        type: String,
        default: "#3498db", // Default primary color
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    featured: {
        type: Boolean,
        default: false,
    },
    eventCount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
