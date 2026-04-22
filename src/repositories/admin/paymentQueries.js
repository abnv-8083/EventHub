import Payment from '../../models/organizer/payment.js';

export const fetchPaymentsByStatus = async (status) => {
    return await Payment.find({ status })
        .populate('eventId',    'title startDate')
        .populate('organizerId', 'organizationName')
        .sort({ createdAt: -1 });
}

export const approvePaymentById = async (id, utr, adminId) => {
    return await Payment.findByIdAndUpdate(id, {
        status:      'Approved',
        utr:         utr || null,
        processedBy: adminId,
        processedAt: new Date()
    }, { new: true });
}

export const rejectPaymentById = async (id, reason, adminId) => {
    return await Payment.findByIdAndUpdate(id, {
        status:          'Rejected',
        rejectionReason: reason,
        processedBy:     adminId,
        processedAt:     new Date()
    }, { new: true });
}
