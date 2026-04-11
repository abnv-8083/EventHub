import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    description: {
        type: String,
        trim: true,
        maxlength: 200,
        default: ''
    },
    icon: {
        type: String,
        default: 'fa-tag'
    },
    color: {
        type: String,
        default: '#e63946'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    eventCount: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
export default Category;