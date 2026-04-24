import mongoose, { Schema } from 'mongoose';

const adminWalletSchema = new Schema({
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const adminTransactionSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: false
    },
    payoutId: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        required: false
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: 'Platform fee from booking'
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        default: 'credit'
    }
}, { timestamps: true });

export const AdminWallet = mongoose.model('AdminWallet', adminWalletSchema);
export const AdminTransaction = mongoose.model('AdminTransaction', adminTransactionSchema);
