import mongoose, { Schema } from 'mongoose';

const cancellationSchema = new Schema({
    bookingId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Booking', 
        required: true 
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    organizerId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Organizer', 
        required: true 
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    type: {
        type: String,
        enum: ['partial', 'full'],
        required: true
    },
    // The specific tickets being cancelled
    tickets: [{
        ticketTypeId: { type: Schema.Types.ObjectId, required: true },
        ticketName: { type: String, required: true },
        quantity: { type: Number, required: true },
        pricePerTicket: { type: Number, required: true },
        subtotal: { type: Number, required: true }
    }],
    refundAmount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        default: 'User requested cancellation'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    utrNumber: {
        type: String,
        default: null
    },
    adminNotes: {
        type: String,
        default: null
    }
}, { timestamps: true });

cancellationSchema.index({ bookingId: 1 });
cancellationSchema.index({ userId: 1 });
cancellationSchema.index({ organizerId: 1 });
cancellationSchema.index({ status: 1 });

const Cancellation = mongoose.model('Cancellation', cancellationSchema);
export default Cancellation;
