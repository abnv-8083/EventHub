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
        required: false
    },
    category: {
        type: String,
        required: false // Removed the strict enum so your dynamic Admin categories work!
    },
    venueLocation: {
        address: { type: String, required: false },
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false }
    },
    // Updated to handle both Dates and Times from your form
    startDate: {
        type: Date,
        required: false
    },
    startTime: {
        type: String,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
    endTime: {
        type: String,
        required: false
    },
    // TICKETING FIXED: Now wrapped in an array [ { ... } ]
    ticketing: [{
        name: {
            type: String,
            required: false
        },
        price: {
            type: Number,
            required: false,
            min: 0
        },
        availableSeats: {
            type: Number,
            required: false,
            min: 1
        },
        bookedSeats: {
            type: Number,
            default: 0,
            min: 0
        },
        maxPerUser: {
            type: Number,
            required: false,
            min: 1
        }
    }],
    // Renamed to match your controller (eventData.bannerImage)
    bannerImage: {
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
        default: 'Pending' // Suggest changing default to 'Pending' so admins can approve it
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