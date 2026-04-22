import * as paymentRepo   from '../../repositories/organizer/paymentQueries.js';
import * as OrganizerService from './organizerService.js';
import AppError    from '../../utils/AppError.js';
import HTTP_STATUS from '../../constants/statusCode.js';

export const submitPayoutRequest = async (eventId, organizerId, bankDetails, notes) => {
    // 1. Validate event is eligible
    const event = await OrganizerService.getEventById(eventId, organizerId);
    if (!['Approved', 'Published'].includes(event.status))
        throw new AppError('Event must be approved for payout.', HTTP_STATUS.FORBIDDEN);

    // 2. Block duplicate pending request
    const existing = await paymentRepo.findPendingPayoutByEvent(eventId);
    if (existing)
        throw new AppError('A payout request for this event is already pending.', HTTP_STATUS.BAD_REQUEST);

    // 3. Validate required bank fields
    const { accountHolder, bankName, accountNumber, ifscCode } = bankDetails;
    if (!accountHolder || !bankName || !accountNumber || !ifscCode)
        throw new AppError('All bank details are required.', HTTP_STATUS.BAD_REQUEST);

    // 4. Calculate amounts
    const gross = event.totalRevenue || 0;
    const fee   = Math.round(gross * 0.05);
    const totalNet = gross - fee;

    const previousPayouts = await paymentRepo.findAllPayoutsByEvent(eventId);
    const totalPayoutDone = previousPayouts
        .filter(p => p.status !== 'Rejected')
        .reduce((sum, p) => sum + p.netAmount, 0);
    const availablePayout = Math.max(0, totalNet - totalPayoutDone);

    if (availablePayout <= 0) {
        throw new AppError('No available funds to payout.', HTTP_STATUS.BAD_REQUEST);
    }

    // 5. Save request
    return await paymentRepo.createPayoutRequest({
        eventId, organizerId,
        grossRevenue:      Math.round(availablePayout / 0.95), // Storing the gross equivalent of this partial payout
        platformFeeAmount: Math.round(availablePayout / 0.95) - availablePayout, 
        netAmount:         availablePayout,
        bankDetails,
        notes
    });
}

export const getEventPayoutHistory = async (eventId) => {
    return await paymentRepo.findAllPayoutsByEvent(eventId);
}

export const getEventTransactions = async (eventId) => {
    return await paymentRepo.findPaidBookingsByEvent(eventId);
}
