import mongoose, { Schema } from 'mongoose';

const paymentSchema = new Schema({
    eventId:      { type: Schema.Types.ObjectId, ref: 'Event',     required: true },
    organizerId:  { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },
    grossRevenue:      { type: Number, required: true },
    platformFeeAmount: { type: Number, required: true },
    netAmount:         { type: Number, required: true },
    bankDetails: {
        accountHolder: { type: String, required: true },
        bankName:      { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifscCode:      { type: String, required: true, uppercase: true },
        branchName:    { type: String, default: null },
        branchCity:    { type: String, default: null }
    },
    status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
    processedBy:     { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    processedAt:     { type: Date,   default: null },
    rejectionReason: { type: String, default: null },
    utr:             { type: String, default: null },
    notes:           { type: String, default: null }
}, { timestamps: true });

paymentSchema.index({ organizerId: 1, status: 1 });
paymentSchema.index({ eventId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
