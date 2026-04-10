import mongoose, { Schema } from "mongoose";

const organizerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    organizationName: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true
    },
    industryCategory: {
        type: String,
        required: true
    },
    operatingRegion: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    commissionRate: {
        type: Number,
        default: 10.0
    }
}, {
    timestamps: true
});

const Organizer = mongoose.model('Organizer', organizerSchema);
export default Organizer;
