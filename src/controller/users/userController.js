import HTTP_STATUS from "../../constants/statusCode.js"
import * as userServices from "../../services/users/userServices.js"
import * as eventServices from "../../services/users/eventServices.js"
import { sendResponse } from "../../utils/responseHandler.js"
import { City } from "country-state-city"
import * as cityConst from "../../constants/cityConstant.js"
import { profileUpdateValidate, editEmailValidate, passwordUpdateValidate, organizerRegisterValidate } from "../../validation/user/user.js"
import * as organizerQuery from "../../repositories/organizer/organizerQueries.js"

export const getHome = async (req, res) => {
    try {
        const { featuredEvents } = await eventServices.getHomeData();
        res.render('public/index', {
            events: featuredEvents,
            user: req.session.user
        });
    } catch (error) {
        console.error("Home Page Error:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}

export const getEvents = async (req, res) => {
    try {
        const data = await eventServices.getEventsData(req.query);
        res.render('public/events', {
            ...data,
            user: req.session.user
        });
    } catch (error) {
        console.error("Events Page Error:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}

export const getEventDetails = async (req, res) => {
    try {
        const eventId = req.params.id;
        const data = await eventServices.getEventDetails(eventId);
        res.render('public/event-details', {
            ...data,
            user: req.session.user
        });
    } catch (error) {
        console.error("Event Details Error:", error);
        res.redirect('/events');
    }
}

export const getBookingPage = async (req, res) => {
    try {
        const eventId = req.params.id;
        const { event } = await eventServices.getBookingData(eventId);
        res.render('public/booking', {
            event,
            user: req.session.user
        });
    } catch (error) {
        console.error("Get Booking Page Error:", error);
        res.redirect('/events');
    }
}

export const postReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const eventId = req.params.id;
        const userId = req.session.user._id;

        await eventServices.postReview({
            event: eventId,
            user: userId,
            rating,
            comment
        });

        return sendResponse(res, HTTP_STATUS.OK, true, 'Review posted successfully!');
    } catch (error) {
        console.error("Post Review Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Failed to post review.');
    }
}

export const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.session.user._id;

        await eventServices.deleteReview(reviewId, userId);

        return sendResponse(res, HTTP_STATUS.OK, true, 'Review deleted successfully!');
    } catch (error) {
        console.error("Error in deleteReview:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message || 'Failed to delete review.');
    }
}

export const toggleWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const eventId = req.params.id;

        const { wishlist, isAdded } = await userServices.toggleWishlist(userId, eventId);
        
        req.session.user.wishlist = wishlist;
        const message = isAdded ? 'Event added to wishlist' : 'Event removed from wishlist';

        return sendResponse(res, HTTP_STATUS.OK, true, message, { isAdded });
    } catch (error) {
        console.error("Toggle Wishlist Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Failed to update wishlist.');
    }
}

export const getWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const wishlist = await userServices.getWishlist(userId);

        res.render('public/wishlist', {
            wishlist,
            user: req.session.user
        });
    } catch (error) {
        console.error("Get Wishlist Error:", error);
        res.redirect('/');
    }
}

// Profile Section
export const getProfile = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const userDb = await userServices.getUserProfile(userId);
        
        const cities = City.getCitiesOfState(cityConst.CITY_COUNTRY, cityConst.CITY_STATE);
        const sortedCity = cities.sort((a,b)=>a.name.localeCompare(b.name));

        res.render('user/profile', {
            user: userDb,
            sortedCity
        });
    } catch (error) {
        console.error("Profile Error:", error);
        res.redirect('/');
    }
}

export const editProfile = async (req, res) => {
    try {
        const { error, value } = profileUpdateValidate.validate(req.body);
        if (error) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.details[0].message);
        }

        const userId = req.session.user._id;
        const { name, phone, city, bio, gender, dob, occupation } = value;

        const updatedUser = await userServices.profileUpdate(userId, name, phone, city, bio, gender, dob, occupation);
        
        // Update session
        req.session.user.name = updatedUser.name;
        
        return sendResponse(res, HTTP_STATUS.OK, true, 'Profile updated successfully!', { user: updatedUser });
    } catch (error) {
        console.error("Edit Profile Error:", error);
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'No image uploaded');
        }

        const userId = req.session.user._id;
        const avatarUrl = req.file.path;

        const updatedUser = await userServices.updateAvatar(userId, avatarUrl);
        
        return sendResponse(res, HTTP_STATUS.OK, true, 'Avatar updated successfully!', { avatar_url: updatedUser.avatar_url });
    } catch (error) {
        console.error("Update Avatar Error:", error);
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const getEditEmail = async (req, res) => {
    res.render('user/edit-email', { user: req.session.user });
}

export const editEmail = async (req, res) => {
    try {
        const { error, value } = editEmailValidate.validate(req.body);
        if (error) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.details[0].message);
        }

        const userId = req.session.user._id;
        await userServices.sendEditEmailOtp(userId, value.newEmail);

        return sendResponse(res, HTTP_STATUS.OK, true, 'OTP sent to your new email!');
    } catch (error) {
        console.error("Edit Email Error:", error);
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const getEditPassword = async (req, res) => {
    res.render('user/edit-password', { user: req.session.user });
}

export const editPassword = async (req, res) => {
    try {
        const { error, value } = passwordUpdateValidate.validate(req.body);
        if (error) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.details[0].message);
        }

        const userId = req.session.user._id;
        const { currentPassword, newPassword } = value;

        await userServices.updatePassword(userId, currentPassword, newPassword);

        return sendResponse(res, HTTP_STATUS.OK, true, 'Password updated successfully!');
    } catch (error) {
        console.error("Edit Password Error:", error);
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const postRegisterOrganizer = async (req, res) => {
    try {
        const { error, value } = organizerRegisterValidate.validate(req.body);
        if (error) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.details[0].message);
        }

        const userId = req.session.user._id;
        const organizer = await organizerQuery.createOrganizerProfile(
            userId,
            value.organizationName,
            value.registrationNumber,
            value.industryCategory,
            value.operatingRegion
        );

        return sendResponse(res, HTTP_STATUS.OK, true, 'Organizer registration successful! Your application is now pending review.', { redirect: '/user/profile' });
    } catch (error) {
        console.error("Organizer Register Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Registration failed. Please try again.');
    }
}

export const postRetryOrganizer = async (req, res) => {
    try {
        const userId = req.session.user._id;
        await organizerQuery.deleteOrganizerProfile(userId);
        return sendResponse(res, HTTP_STATUS.OK, true, 'Application reset successful. You can now try again.', { redirect: '/user/organizer/register' });
    } catch (error) {
        console.error("Retry Organizer Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Failed to reset application.');
    }
}

export const postCheckout = async (req, res) => {
    try {
        const userId    = req.session.user._id;
        const { eventId, tickets } = req.body;
        const selection = JSON.parse(tickets);
        const { order, booking } = await userServices.createCheckoutOrder(userId, eventId, selection);
        return sendResponse(res, HTTP_STATUS.OK, true, 'Order created', {
            orderId:   order.id,
            amount:    order.amount,
            currency:  'INR',
            keyId:     process.env.RAZORPAY_KEY_ID,
            bookingId: booking._id,
            userName:  req.session.user.name,
            userEmail: req.session.user.email
        });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        await userServices.verifyAndCompletePayment(
            razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId
        );

        return sendResponse(res, HTTP_STATUS.OK, true, 'Payment successful!',{ bookingId });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
};

export const getPaymentSuccess = async (req, res) => {
    try {
        const booking = await userServices.getBookingWithEvent(req.params.id, req.session.user._id);
        res.render('user/payment-success', { booking, user: req.session.user });
    } catch (error) {
        res.redirect('/');
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await userServices.getUserBookings(req.session.user._id);
        res.render('user/my-bookings', { bookings, user: req.session.user, activePage: 'tickets' });
    } catch (error) {
        console.error("My Bookings Error:", error);
        res.redirect('/');
    }
};

export const getCancelBooking = async (req, res) => {
    try {
        const booking = await userServices.getBookingWithEvent(req.params.id, req.session.user._id);
        res.render('user/cancel-booking', { booking, user: req.session.user, activePage: 'tickets' });
    } catch (error) {
        res.redirect('/user/bookings');
    }
};

export const postCancelBooking = async (req, res) => {
    try {
        const { cancelledTickets: rawTickets, reason } = req.body;
        const bookingId = req.params.id;
        const userId = req.session.user._id;

        const booking = await userServices.getBookingWithEvent(bookingId, userId);

        let cancelledTickets = [];
        let refundAmount = 0;

        if (!rawTickets || rawTickets.length === 0) {
            // Full cancellation — cancel all tickets
            cancelledTickets = booking.tickets.map(t => ({
                ticketTypeId: t.ticketTypeId,
                ticketName: t.ticketName,
                quantity: t.quantity,
                pricePerTicket: t.pricePerTicket,
                subtotal: t.subtotal
            }));
            refundAmount = booking.subtotal;
        } else {
            // Partial / single-ticket cancellation
            rawTickets.forEach(item => {
                const qty = parseInt(item.quantity);
                const price = parseFloat(item.pricePerTicket);
                if (qty > 0) {
                    cancelledTickets.push({
                        ticketTypeId: item.ticketTypeId,
                        ticketName: item.ticketName,
                        quantity: qty,
                        pricePerTicket: price,
                        subtotal: qty * price
                    });
                    refundAmount += qty * price;
                }
            });
        }

        if (cancelledTickets.length === 0) {
            return res.status(400).json({ success: false, message: 'No tickets selected for cancellation.' });
        }

        // Determine if full or partial cancellation
        const totalBookedQty  = booking.tickets.reduce((s, t) => s + t.quantity, 0);
        const totalCancelledQty = cancelledTickets.reduce((s, t) => s + t.quantity, 0);
        const cancellationType = totalCancelledQty >= totalBookedQty ? 'full' : 'partial';

        await userServices.createCancellation({
            bookingId,
            userId,
            organizerId: booking.organizerId,
            eventId: booking.eventId._id,
            type: cancellationType,
            tickets: cancelledTickets,
            refundAmount,
            reason: reason || 'User requested cancellation'
        });

        res.json({ success: true, message: 'Cancellation request submitted successfully!' });
    } catch (error) {
        console.error("Post Cancel Error:", error);
        res.status(500).json({ success: false, message: error.message || 'Failed to submit cancellation request.' });
    }
};

export const getRefundStatus = async (req, res) => {
    try {
        const cancellations = await userServices.getCancellationRequests(req.session.user._id);
        res.render('user/refund-status', { cancellations, user: req.session.user, activePage: 'refund-status' });
    } catch (error) {
        res.redirect('/');
    }
};



// Static pages
export const getAbout = (req, res) => {
    res.render('public/about', { user: req.session.user });
}

export const getContact = (req, res) => {
    res.render('public/contact', { user: req.session.user });
}

export const getBecomeOrganizer = (req, res) => {
    res.render('public/become-organizer', { user: req.session.user });
}