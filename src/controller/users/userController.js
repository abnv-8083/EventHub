import HTTP_STATUS from "../../constants/statusCode.js"
import * as userServices from "../../services/users/userServices.js"
import { sendResponse, sendConfirmation } from "../../utils/responseHandler.js"
import { City } from "country-state-city"
import * as cityConst from "../../constants/cityConstant.js"
import { profileUpdateValidate, editEmailValidate, passwordUpdateValidate, organizerRegisterValidate } from "../../validation/user/user.js"
import * as organizerQuery from "../../repositories/organizer/organizerQueries.js"
import Event from "../../models/organizer/event.js"
import Category from "../../models/admin/category.js"
import Review from "../../models/users/review.js"

export const getHome = async (req, res) => {
    try {
        const events = await Event.find({ 
            status: { $in: ['Approved', 'Published'] }, 
            visibility: 'Public',
            isFeatured: true
        })
        .sort({ createdAt: -1 })
        .limit(3);
        res.render('public/index', { events });
    } catch (error) {
        console.error("Error in getHome:", error);
        res.render('public/index', { events: [] });
    }
}

export const getEvent = async (req, res) => {
    try {
        const { search, category, date, sort, minPrice, maxPrice, city, featured, page } = req.query;
        const currentPage = parseInt(page) || 1;
        const limit = 9;
        const skip = (currentPage - 1) * limit;

        const query = { 
            status: { $in: ['Approved', 'Published'] }, 
            visibility: 'Public' 
        };

        // Search Filter
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Category Filter
        if (category && category !== 'All Types') {
            query.category = category;
        }

        // City Filter
        if (city) {
            query['venueLocation.address'] = { $regex: city, $options: 'i' };
        }

        // Featured Filter
        if (featured === 'true') {
            query.isFeatured = true;
        }

        // Date Filter
        if (date) {
            const now = new Date();
            if (date === 'Today') {
                const start = new Date(); start.setHours(0, 0, 0, 0);
                const end = new Date(); end.setHours(23, 59, 59, 999);
                query.startDate = { $gte: start, $lte: end };
            } else if (date === 'This Weekend') {
                const friday = new Date();
                friday.setDate(now.getDate() + (5 - now.getDay()));
                const sunday = new Date();
                sunday.setDate(now.getDate() + (7 - now.getDay()));
                query.startDate = { $gte: friday, $lte: sunday };
            } else if (date === 'Next 30 Days') {
                const end = new Date();
                end.setDate(now.getDate() + 30);
                query.startDate = { $gte: now, $lte: end };
            }
        }

        // Price Filter
        if (minPrice || maxPrice) {
            query['ticketing.price'] = {};
            if (minPrice) query['ticketing.price'].$gte = parseInt(minPrice);
            if (maxPrice) query['ticketing.price'].$lte = parseInt(maxPrice);
        }

        // Sort Options
        let sortOption = { createdAt: -1 };
        if (sort === 'POPULAR') sortOption = { totalRevenue: -1 };
        if (sort === 'NEWEST') sortOption = { createdAt: -1 };
        if (sort === 'OLDEST') sortOption = { createdAt: 1 };
        if (sort === 'PRICE_LOW') sortOption = { 'ticketing.0.price': 1 };
        if (sort === 'PRICE_HIGH') sortOption = { 'ticketing.0.price': -1 };
        if (sort === 'ALPHABETICAL') sortOption = { title: 1 };

        const cityes = City.getCitiesOfState(cityConst.CITY_COUNTRY, cityConst.CITY_STATE);
        const sortedCities = cityes.sort((a, b) => a.name.localeCompare(b.name));

        const [events, total, categories] = await Promise.all([
            Event.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            Event.countDocuments(query),
            Category.find({ status: 'Active' }).sort({ name: 1 })
        ]);

        const totalPages = Math.ceil(total / limit);

        res.render('public/events', { 
            events, 
            categories,
            sortedCities,
            currentPage, 
            totalPages,
            total,
            currentSearch: search || '',
            currentCategory: category || '',
            currentDate: date || '',
            currentSort: sort || 'ALL EVENTS',
            currentMinPrice: minPrice || '',
            currentMaxPrice: maxPrice || '',
            currentCity: city || '',
            isFeaturedOnly: featured === 'true'
        });
    } catch (error) {
        console.error("Error in getEvent:", error);
        res.render('public/events', { 
            events: [], 
            categories: [],
            sortedCities: [],
            currentPage: 1, 
            totalPages: 0, 
            total: 0,
            currentSearch: '',
            currentCategory: '',
            currentDate: '',
            currentSort: 'ALL EVENTS',
            currentMinPrice: '',
            currentMaxPrice: '',
            currentCity: '',
            isFeaturedOnly: false
        });
    }
}

export const getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizerId');
        if (!event) {
            return res.status(404).render('error', { message: 'Event not found' });
        }
        
        const reviews = await Review.find({ event: req.params.id }).populate('user').sort({ createdAt: -1 });
        
        res.render('public/event-details', { 
            event, 
            reviews,
            user: req.session.user || null 
        });
    } catch (error) {
        console.error("Error in getEventDetails:", error);
        res.status(500).render('error', { message: 'Failed to load event details' });
    }
}
export const getAbout =(req,res) =>{
    res.render('public/about')
}
export const getContact =(req,res) =>{
    res.render('public/contact')
}

export const getBecomeOrganizer = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render('public/become-organizer');
        }

        const organizer = await organizerQuery.getOrganizerByUserId(req.session.user._id);
        
        if (organizer) {
            if (organizer.status === 'Approved') {
                return res.redirect('/organizer/dashboard');
            }
            // Pass the organizer details (Pending or Rejected)
            return res.render('public/become-organizer', { organizer });
        }

        res.render('public/become-organizer', { organizer: null });
    } catch (error) {
        console.error("Error in getBecomeOrganizer:", error);
        res.render('public/become-organizer', { organizer: null });
    }
}

export const getRegisterOrganizer = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/user/login');
        }

        const userId = req.session.user._id;
        const existingReq = await organizerQuery.getOrganizerByUserId(userId);
        if (existingReq) {
            // Show appropriate status page instead of silent redirect
            return res.render('user/organizer-status', { organizer: existingReq });
        }
        const cityes = City.getCitiesOfState(cityConst.CITY_COUNTRY, cityConst.CITY_STATE);
        const sortedCity = cityes.sort((a, b) => a.name.localeCompare(b.name));
        res.render('user/register-organizer', { sortedCity, user: req.session.user });
    } catch (error) {
        console.error(error);
        res.redirect('/profile');
    }
}

export const postRegisterOrganizer = async (req, res) => {
    const { error, value } = organizerRegisterValidate.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details[0].message.replace(/"/g, '');
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, errorMessage);
    }
    try {
        if (!req.session.user) {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, 'Please login to submit organizer application.');
        }

        const userId = req.session.user._id;
        const { email, organizationName, industryCategory, operatingRegion } = value;
        const organizerEmail = email || req.session.user.email;

        // Ensure user hasn't already submitted
        const existingReq = await organizerQuery.getOrganizerByUserId(userId);
        if (existingReq) {
            return sendResponse(res, HTTP_STATUS.CONFLICT, false, 'You have already submitted an application.');
        }

        // If user email differs from session email, keep the session source as canonical.
        if (organizerEmail !== req.session.user.email) {
            req.session.user.email = organizerEmail;
        }

        // Auto-generate a unique Registration Number
        const registrationNumber = `EH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        // Create the application
        await organizerQuery.createOrganizerProfile(userId, organizationName, registrationNumber, industryCategory, operatingRegion);

        // Flag session so navbar can show pending badge without a DB call
        req.session.user.hasPendingOrganizer = true;

        return sendResponse(res, HTTP_STATUS.CREATED, true, 'Application submitted! Our team will review your details.', { redirect: '/become-organizer' });
    } catch (error) {
        console.error("Error creating organizer application:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Failed to submit application.');
    }
}

export const getProfile = (req,res) =>{
    const cityes = City.getCitiesOfState(cityConst.CITY_COUNTRY,cityConst.CITY_STATE)
    const sortedCity = cityes.sort((a,b)=>a.name.localeCompare(b.name))
    res.render('user/profile',{sortedCity})
}

export const editProfile = async (req,res) =>{
    const {error, value} = profileUpdateValidate.validate(req.body,{abortEarly:false})
    if(error){
        const errorMessage = error.details[0].message.replace(/"/g, '');
        return sendResponse(res,HTTP_STATUS.BAD_REQUEST,false,errorMessage)
    }
    try {
        const {id,name,phone,city,bio,gender,dob,occupation} = value
        const updatedUser = await userServices.profileUpdate(id,name,phone,city,bio,gender,dob,occupation)
        req.session.user = updatedUser
        return sendResponse(res,HTTP_STATUS.ACCEPTED,true,'User Updated Successfully')
    } catch (error) {
        return sendResponse(res,error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,false,error.message)
    }
}

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            console.error("Avatar Upload Error: No file provided in request");
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'No image uploaded')
        }
        const avatarUrl = req.file.path // Cloudinary URL
        const userId = req.session.user._id
        const updatedUser = await userServices.updateAvatar(userId, avatarUrl)
        req.session.user = updatedUser
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, 'Avatar Updated Successfully')
    } catch (error) {
        console.error("Avatar Upload Error Detail:", error);
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}

export const getEditEmail = (req, res) => {
    res.render('user/edit-email')
}

export const editEmail = async (req,res) =>{
    const {error, value} = editEmailValidate.validate(req.body, {abortEarly: false})
    if(error){
        const errorMessage = error.details[0].message.replace(/"/g, '');
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, errorMessage)
    }
    try {
        const {id, email} = value
        
        // Generate OTP and store in Redis along with new email request
        await userServices.sendEditEmailOtp(id, email)
        
        // Redirect to OTP verification page
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, 'OTP Sent to new email. Please verify.', { 
            redirect: `/user/otp-verify?email=${email}&name=User&purpose=edit-email` 
        })
    } catch (error) {
        if(error.code === 11000) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Email is already taken')
        }
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}

export const getEditPassword = (req, res) => {
    res.render('user/edit-password')
}

export const editPassword = async (req, res) => {
    const { error, value } = passwordUpdateValidate.validate(req.body, { abortEarly: false })
    if (error) {
        const errorMessage = error.details[0].message.replace(/"/g, '');
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, errorMessage)
    }
    try {
        const { id, currentPassword, newPassword } = value
        const updatedUser = await userServices.updatePassword(id, currentPassword, newPassword)
        req.session.user = updatedUser
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, 'Password Updated Successfully', { redirect: '/user/profile' })
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}

export const postRetryOrganizer = async (req, res) => {
    try {
        const userId = req.session.user._id;
        await organizerQuery.deleteOrganizerProfile(userId);
        return sendResponse(res, HTTP_STATUS.OK, true, 'Previous application cleared. You can now apply again.', { redirect: '/user/organizer/register' });
    } catch (error) {
        console.error("Error in postRetryOrganizer:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Failed to clear application.');
    }
}

export const postReview = async (req, res) => {
    try {
        if (!req.session.user) {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, 'Please login to leave a review.');
        }

        const { rating, comment } = req.body;
        const eventId = req.params.id;
        const userId = req.session.user._id;

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Please provide a valid rating between 1 and 5.');
        }
        if (!comment || comment.trim().length === 0) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Review comment cannot be empty.');
        }

        // Check if user already reviewed
        const existingReview = await Review.findOne({ event: eventId, user: userId });
        if (existingReview) {
            return sendResponse(res, HTTP_STATUS.CONFLICT, false, 'You have already reviewed this event.');
        }

        const newReview = new Review({
            event: eventId,
            user: userId,
            rating,
            comment: comment.trim()
        });

        await newReview.save();

        return sendResponse(res, HTTP_STATUS.CREATED, true, 'Review submitted successfully!');
    } catch (error) {
        console.error("Error in postReview:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Failed to submit review.');
    }
}

export const deleteReview = async (req, res) => {
    try {
        if (!req.session.user) {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, 'Please login to perform this action.');
        }

        const reviewId = req.params.id;
        const userId = req.session.user._id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Review not found.');
        }

        // Only allow the owner (or potentially admin) to delete
        if (review.user.toString() !== userId.toString()) {
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'You are not authorized to delete this review.');
        }

        await Review.findByIdAndDelete(reviewId);

        return sendResponse(res, HTTP_STATUS.OK, true, 'Review deleted successfully!');
    } catch (error) {
        console.error("Error in deleteReview:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Failed to delete review.');
    }
}

export const getBookingPage = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId).populate('organizerId');

        if (!event) {
            return res.redirect('/events');
        }

        res.render('public/booking', {
            event,
            user: req.session.user
        });
    } catch (error) {
        console.error("Get Booking Page Error:", error);
        res.redirect('/events');
    }
}