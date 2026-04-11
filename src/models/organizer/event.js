import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema({
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Music', 'Technology', 'Art', 'Business', 'Sports', 'Social', 'Education', 'Other'],
        required: true
    },
    venueLocation: {
        address: {
            type: String,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    ticketing: [{
        price: {
            type: Number,
            required: true,
            min: 0
        },
        availableSeats: {
            type: Number,
            required: true,
            min: 1
        },
        bookedSeats: {
            type: Number,
            default: 0,
            min: 0
        },
        maxPerUser: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    banner: {
        type: String,
        default: null
    },
    visibility: {
        type: String,
        enum: ['Public', 'Private'],
        default: 'Public'
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Published', 'Cancelled'],
        default: 'Draft'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [String],
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
eventSchema.index({ organizerId: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ visibility: 1, status: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
