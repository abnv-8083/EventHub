import Payment from '../../models/organizer/payment.js';
import Booking from '../../models/users/bookings.js';

export const findPendingPayoutByEvent = async (eventId) => {
    return await Payment.findOne({ eventId, status: 'Pending' });
}

export const createPayoutRequest = async (data) => {
    return await Payment.create(data);
}

export const findAllPayoutsByEvent = async (eventId) => {
    return await Payment.find({ eventId }).sort({ createdAt: -1 });
}

export const findPaidBookingsByEvent = async (eventId) => {
    return await Booking.find({ eventId, status: 'paid' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
}
