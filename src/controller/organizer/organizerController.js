import * as OrganizerService from '../../services/organizers/organizerService.js';
import * as organizerValidation from '../../validation/organizer/organizer.validation.js'
import { sendResponse } from "../../utils/responseHandler.js";
import HTTP_STATUS from "../../constants/statusCode.js";
import qs from 'qs'

export const getDashboard = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { organizer, stats } = await OrganizerService.getDashboardData(userId);

        res.render('organizer/dashboard', {
            organizer,
            stats,
            user: req.session.user
        });
    } catch (error) {
        console.error("Organizer Dashboard Error:", error);
        res.redirect('/');
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const profileData = await OrganizerService.getProfileData(userId);

        res.render('organizer/profile', {
            ...profileData,
            user: req.session.user
        });
    } catch (error) {
        console.error("Organizer Profile Error:", error);
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message || 'Server Error');
    }
}

export const postProfile = async (req, res) => {
    try {
        const organizerId = req.session.user.organizerId;
        const { organizationName, industryCategory, operatingRegion } = req.body;

        if (!organizationName || !industryCategory || !operatingRegion) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "All fields are required");
        }

        await OrganizerService.updateOrganizerProfile(organizerId, {
            organizationName,
            industryCategory,
            operatingRegion
        });

        return sendResponse(res, HTTP_STATUS.OK, true, "Organization profile updated successfully");
    } catch (error) {
        console.error("Organizer Profile Update Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to update profile");
    }
}

export const getCreateEvent = async (req, res) => {
    try {
        const category = await OrganizerService.getCreateEventData();
        console.log(category)
        res.render('organizer/create-event', {
            category,
            user: req.session.user
        });
    } catch (error) {
        console.error("Create Event Page Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to Load Event Page");
    }
}

export const postCreateEvent = async (req, res) => {
    try {
        const organizerId = req.session.user.organizerId;

        // Use qs to parse nested objects (tickets, etc.) from the flat req.body
        const parseBody = qs.parse(qs.stringify(req.body));

        // Determine which schema to use
        const status = parseBody.status || 'Pending';
        const schema = status === 'Draft' ? organizerValidation.draftEventSchema : organizerValidation.createEventSchema;

        const { error, value } = schema.validate(parseBody, { abortEarly: false, allowUnknown: true, stripUnknown: true });

        if (error) {
            const errorMessages = error.details.map(err => err.message);
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, errorMessages);
        }

        const eventData = value;
        if (req.file) {
            eventData.bannerImage = req.file.path;
        }

        const event = await OrganizerService.postCreateEvent(eventData, organizerId);
        return sendResponse(res, HTTP_STATUS.OK, true, `${event.title} created successfully`, { redirect: '/organizer/event' })
    } catch (error) {
        console.error("Create Event Page Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error)
    }
}

export const getEventMangement = async (req, res) => {
    try {
        const { search, sort, status, page } = req.query;
        const currentPage = parseInt(page) || 1;
        const organizerId = req.session.user.organizerId;
        
        const { events, total, totalPages, stats } = await OrganizerService.getEvents(organizerId, { search, sort, status }, currentPage);
        
        res.render('organizer/manage-events', {
            events,
            stats,
            total,
            totalPages,
            currentPage,
            user: req.session.user,
            currentSearch: search || '',
            currentSort: sort || 'newest',
            currentStatus: status || ''
        });
    } catch (error) {
        console.error("Event Management Page Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error)
    }
}

export const getEventDetails = async (req, res) => {
    try {
        const eventId = req.params.id;
        const organizerId = req.session.user.organizerId;
        const event = await OrganizerService.getEventById(eventId, organizerId);

        res.render('organizer/view-event', {
            event,
            user: req.session.user
        });
    } catch (error) {
        console.error("View Event Details Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const getEditEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const organizerId = req.session.user.organizerId;
        const [event, category] = await Promise.all([
            OrganizerService.getEventById(eventId, organizerId),
            OrganizerService.getCreateEventData()
        ]);

        res.render('organizer/edit-event', {
            event,
            category,
            user: req.session.user
        });
    } catch (error) {
        console.error("Edit Event Page Error:", error);
        res.redirect('/organizer/event');
    }
}

export const postEditEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const organizerId = req.session.user.organizerId;

        // Use qs to parse nested objects (tickets, etc.) from the flat req.body
        const parseBody = qs.parse(qs.stringify(req.body));

        // Determine which schema to use (Edit process keeps current status unless toggled to Pending)
        const status = parseBody.status || 'Pending';
        const schema = status === 'Draft' ? organizerValidation.draftEventSchema : organizerValidation.createEventSchema;

        const { error, value } = schema.validate(parseBody, { abortEarly: false, allowUnknown: true, stripUnknown: true });

        if (error) {
            const errorMessages = error.details.map(err => err.message);
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, errorMessages);
        }

        const eventData = value;
        if (req.file) {
            eventData.bannerImage = req.file.path;
        }

        await OrganizerService.updateEventById(eventId, organizerId, eventData, req.file);

        return sendResponse(res, HTTP_STATUS.OK, true, 'Event updated successfully!', { redirect: '/organizer/event' });
    } catch (error) {
        console.error("Update Event Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message || 'Failed to update event');
    }
}

export const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const organizerId = req.session.user.organizerId;

        await OrganizerService.deleteEventById(eventId, organizerId);

        return sendResponse(res, HTTP_STATUS.OK, true, "Event deleted successfully");
    } catch (error) {
        console.error("Delete Event Error:", error);
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.message);
    }
}

export const getEventReviews = async (req, res) => {
    try {
        const eventId = req.params.id;
        const organizerId = req.session.user.organizerId;
        const { event, reviews } = await OrganizerService.getEventReviews(eventId, organizerId);

        res.render('organizer/event-reviews', {
            event,
            reviews,
            user: req.session.user
        });
    } catch (error) {
        console.error("View Event Reviews Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}