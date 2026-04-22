import { generateOTP } from "../../utils/generateOtp.js"
import RedisHelper from "../../utils/redisHelper.js"
import { sendEmail } from "../../constants/sendEmail.js"
import * as otpConst from "../../constants/otpConstant.js"
import * as passwordUtil from "../../utils/password.js"
import * as userQuery from "../../repositories/users/usersQueries.js"
import * as wishlistRepo from "../../repositories/users/wishlistQueries.js"
import * as bookingRepo from "../../repositories/users/bookingQueries.js"
import * as eventRepo from "../../repositories/users/eventQueries.js"
import AppError from "../../utils/AppError.js"
import HTTP_STATUS from "../../constants/statusCode.js"
import razorpay from "../../utils/razorpay.js"



export const toggleWishlist = async (userId, eventId) => {
    return await wishlistRepo.toggleWishlist(userId, eventId);
}

export const getWishlist = async (userId) => {
    return await wishlistRepo.fetchUserWishlist(userId);
}


export const getUserProfile = async (userId) => {
    return await userQuery.fetchUserById(userId);
}

export const profileUpdate = async (id, name, phone, city, bio, gender, dob, occupation) =>{
    const editedUser = await userQuery.editUser(id, name, phone, city, bio, gender, dob, occupation)
    if(!editedUser){
        throw new AppError('Failed to Edit User Detail', HTTP_STATUS.BAD_REQUEST)
    }
    return editedUser
}

export const updateAvatar = async (id, avatarUrl) => {
    const updatedUser = await userQuery.editUserAvatar(id, avatarUrl)
    if (!updatedUser) {
        throw new AppError('Failed to Update Avatar', HTTP_STATUS.BAD_REQUEST)
    }
    return updatedUser
}

export const sendEditEmailOtp = async (id, newEmail) => {
    const checkEmail = await userQuery.checkByEmail(newEmail);
    if (checkEmail) {
        throw new AppError("Email is already taken", HTTP_STATUS.BAD_REQUEST);
    }

    const otp = generateOTP();
    const expiry = otpConst.OTP_EXPIRY_MINUTES * 60;
    const lockUntil = Date.now() + (otpConst.RESEND_OTP_MINUTES * 60 * 1000);

    const data = {
        otp: otp,
        otpLimit: otpConst.RESEND_OTP_LIMIT,
        resendLock: lockUntil,
        purpose: "Edit Email Otp",
        userData: { id, newEmail }
    };

    await RedisHelper.setData(newEmail, data, expiry);
    
    const userDb = await userQuery.fetchUserById(id);
    const name = userDb ? userDb.name : "User";

    await sendEmail({ email: newEmail, name, data });

    return true;
}

export const updatePassword = async (id, currentPassword, newPassword) => {
    const userDb = await userQuery.fetchUserById(id);
    if (!userDb) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }
    
    // Check old password if user already has one
    if (userDb.password) {
        if (!currentPassword) {
            throw new AppError("Current password is required", HTTP_STATUS.BAD_REQUEST);
        }
        const isMatch = await passwordUtil.verifyPassword(currentPassword, userDb.password);
        if (!isMatch) {
            throw new AppError("Incorrect current password", HTTP_STATUS.UNAUTHORIZED);
        }
    }
    
    const hashPass = await passwordUtil.hashPassword(newPassword);
    const updatedUser = await userQuery.updatePassword(id, hashPass);
    return updatedUser;
}



export const createCheckoutOrder = async (userId, eventId, selection) => {
    // 1. Validate seats and build ticket items
    const eventData = await eventRepo.fetchEventById(eventId);
    if (!eventData) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    let subtotal    = 0;
    const ticketItems = [];

    for (const [ticketTypeId, item] of Object.entries(selection)) {
        const tier      = eventData.ticketing.id(ticketTypeId);
        if (!tier) throw new AppError(`Ticket tier not found: ${item.name}`, HTTP_STATUS.BAD_REQUEST);

        const available = tier.availableSeats - tier.bookedSeats;
        if (item.qty > available)
            throw new AppError(`Only ${available} seats left for ${tier.name}`, HTTP_STATUS.BAD_REQUEST);

        const sub = item.price * item.qty;
        subtotal += sub;
        ticketItems.push({
            ticketTypeId,
            ticketName:     item.name,
            quantity:       item.qty,
            pricePerTicket: item.price,
            subtotal:       sub
        });
    }

    // 2. Calculate totals
    const platformFee = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + platformFee;

    // 3. Create Razorpay order
    const order = await razorpay.orders.create({
        amount:   totalAmount * 100,   // paise
        currency: 'INR',
        receipt:  `rcpt_${Date.now()}`
    });

    // 4. Save pending booking
    const booking = await bookingRepo.createPendingBooking({
        userId, eventId,
        organizerId: eventData.organizerId,
        tickets:     ticketItems,
        subtotal, platformFee, totalAmount,
        razorpay_order_id: order.id
    });

    return { order, booking };
}

export const verifyAndCompletePayment = async (orderId, paymentId, signature, bookingId) => {
    // 1. Verify HMAC signature
    const crypto      = await import('crypto');
    const expectedSig = crypto.default
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId)
        .digest('hex');

    if (expectedSig !== signature)
        throw new AppError('Payment verification failed', HTTP_STATUS.BAD_REQUEST);

    // 2. Get booking
    const booking = await bookingRepo.findBookingById(bookingId);
    if (!booking || booking.status === 'paid')
        throw new AppError('Booking not found or already processed', HTTP_STATUS.BAD_REQUEST);

    // 3. Save payment details + mark paid
    const qrData = `EVH-${booking._id}-${Date.now()}`;
    await bookingRepo.markBookingPaid(bookingId, paymentId, signature, qrData);

    // 4. Update event seats + revenue
    await bookingRepo.incrementBookedSeatsAndRevenue(
        booking.eventId, booking.tickets, booking.subtotal, booking.userId
    );

    return true;
}

export const getBookingWithEvent = async (bookingId, userId) => {
    const booking = await bookingRepo.findBookingWithEvent(bookingId);
    if (!booking || booking.userId.toString() !== userId.toString())
        throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
    return booking;
}


