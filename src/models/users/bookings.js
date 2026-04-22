import mongoose, { Schema } from 'mongoose';

const bookingSchema = new Schema({
    userId:      { type: Schema.Types.ObjectId, ref: 'User',      required: true },
    eventId:     { type: Schema.Types.ObjectId, ref: 'Event',     required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },

    tickets: [{
        ticketTypeId:   { type: Schema.Types.ObjectId, required: true },
        ticketName:     { type: String,  required: true },
        quantity:       { type: Number,  required: true, min: 1 },
        pricePerTicket: { type: Number,  required: true },
        subtotal:       { type: Number,  required: true }
    }],

    subtotal:    { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    razorpay_order_id:   { type: String, required: true, unique: true },
    razorpay_payment_id: { type: String, default: null },
    razorpay_signature:  { type: String, default: null },

    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    qrData: { type: String, default: null }

}, { timestamps: true });

bookingSchema.index({ userId: 1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ razorpay_order_id: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
