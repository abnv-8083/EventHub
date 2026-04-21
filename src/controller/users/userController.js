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