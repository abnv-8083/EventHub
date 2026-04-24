import * as OrganizerRepo from '../../repositories/organizer/organizerQueries.js';
import * as EventRepo from '../../repositories/organizer/eventsQueries.js';
import * as UserRepo from "../../repositories/users/usersQueries.js";
import Category from '../../models/admin/category.js';
import Review from '../../models/users/review.js';
import { City } from "country-state-city";
import * as cityConst from "../../constants/cityConstant.js";

export const getDashboardData = async (userId) => {
    const organizer = await OrganizerRepo.getOrganizerByUserId(userId);
    if (!organizer) {
        throw new Error("Organizer not found");
    }

    const stats = await getOrganizerStats(organizer._id);
    return { organizer, stats };
};

export const getOrganizerByUserId = async (userId) => {
    return await OrganizerRepo.getOrganizerByUserId(userId);
};

export const getOrganizerStats = async (organizerId) => {
    // For stats, we need all events. fetchEvents is now paginated by default.
    // We pass large limit to get all events for now (or better, use a specific agg query).
    const { events } = await EventRepo.fetchEvents(organizerId, {}, {}, 1, 10000);
    
    if (!Array.isArray(events)) return { liveEvents: 0, ticketsSold: 0, totalRevenue: 0, totalEvents: 0 };

    const stats = events.reduce((acc, event) => {
        // Count live/published events
        if (['Approved', 'Published'].includes(event.status)) {
            acc.liveEvents++;
        }
        
        // Sum tickets sold and revenue
        const eventSold = event.ticketing?.reduce((sum, t) => sum + (t.bookedSeats || 0), 0) || 0;
        acc.ticketsSold += eventSold;
        acc.totalRevenue += (event.totalRevenue || 0);
        
        return acc;
    }, { liveEvents: 0, ticketsSold: 0, totalRevenue: 0, totalEvents: events.length });

    return stats;
};

export const getProfileData = async (userId) => {
    const [organizer, user] = await Promise.all([
        OrganizerRepo.getOrganizerByUserId(userId),
        UserRepo.fetchUserById(userId, '-password')
    ]);

    const cities = City.getCitiesOfState(cityConst.CITY_COUNTRY, cityConst.CITY_STATE);
    const sortedCity = cities.sort((a, b) => a.name.localeCompare(b.name));

    return { organizer, user, sortedCity };
};

export const updateOrganizerProfile = async (organizerId, profileData) => {
    const { organizationName, industryCategory, operatingRegion } = profileData;
    const updatedOrganizer = await OrganizerRepo.updateOrganizerProfile(organizerId, organizationName, industryCategory, operatingRegion);

    if (!updatedOrganizer) {
        throw new Error("Failed to update organizer profile");
    }

    return updatedOrganizer;
};

export const getCreateEventData = async () => {
    // Fetching only active categories for the event creation dropdown
    const categories = await Category.find({ status: 'Active' }).sort({ name: 1 });
    return categories;
};

export const postCreateEvent = async (eventData, organizerId) => {
    const { latitude, longitude, address, tickets, ...rest } = eventData;

    const modelData = {
        ...rest,
        organizerId,
        venueLocation: { address, latitude, longitude },
        ticketing: tickets,
        status: eventData.status || 'Pending'
    };

    const event = await EventRepo.createEvent(modelData);
    return event;
}

export const getEvents = async (organizerId, filters = {}, page = 1, limit = 10) => {
    const { search, sort, status } = filters;
    let sortOption = { createdAt: -1 };

    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'alphabetical') sortOption = { title: 1 };
    if (sort === 'revenue') sortOption = { totalRevenue: -1 };

    const [eventsData, stats] = await Promise.all([
        EventRepo.fetchEvents(organizerId, { search, status }, sortOption, page, limit),
        getOrganizerStats(organizerId)
    ]);
    return { ...eventsData, stats };
}

export const getEventById = async (eventId, organizerId) => {
    const event = await EventRepo.fetchEventId(eventId, organizerId)
    if (!event) {
        throw new Error("Event not found or access denied")
    }
    return event
}

export const updateEventById = async (eventId, organizerId, eventData, file) => {
    // 1. Prepare base update data from pre-validated eventData
    const { title, description, category, startDate, startTime, endDate, endTime, visibility, status, tags, address, latitude, longitude, tickets, isFeatured } = eventData;
    
    const updateData = {
        title,
        description,
        category,
        startDate,
        startTime,
        endDate,
        endTime,
        visibility,
        status: status || undefined, // Keep current status if not provided
        tags: Array.isArray(tags) ? tags : (tags ? JSON.parse(tags) : []),
        isFeatured: isFeatured !== undefined ? isFeatured : false
    };

    // 2. Reshape Location if fields are present
    if (address || latitude || longitude) {
        updateData.venueLocation = {
            address: address || undefined,
            latitude: latitude !== undefined ? Number(latitude) : undefined,
            longitude: longitude !== undefined ? Number(longitude) : undefined
        };
    }

    // 3. Map Tickets if present
    if (tickets) {
        const ticketList = Array.isArray(tickets) ? tickets : Object.values(tickets);
        updateData.ticketing = ticketList.map(t => ({
            name: t.name,
            price: t.price !== undefined ? Number(t.price) : undefined,
            availableSeats: t.availableSeats !== undefined ? Number(t.availableSeats) : undefined,
            maxPerUser: t.maxPerUser !== undefined ? Number(t.maxPerUser) : undefined
        }));
    }

    // 4. Handle Banner if provided
    if (file) {
        updateData.bannerImage = file.path;
    }

    const updatedEvent = await EventRepo.updateEventIfOrganizer(eventId, organizerId, updateData);
    if (!updatedEvent) {
        throw new Error("Failed to update event or access denied");
    }
    return updatedEvent;
}

export const deleteEventById = async (eventId, organizerId) => {
    // 1. Fetch event to verify existence and check sales
    const event = await EventRepo.fetchEventId(eventId, organizerId);
    if (!event) {
        throw new Error("Event not found or access denied");
    }

    // 2. Prevent deletion if tickets are sold
    const totalBookings = event.ticketing.reduce((sum, t) => sum + (t.bookedSeats || 0), 0)
    if (totalBookings > 0) {
        throw new Error("Cannot delete event with active bookings. Consider cancelling it instead.");
    }

    // 3. Perform deletion
    return await EventRepo.deleteEventIfOrganizer(eventId, organizerId);
}

export const getEventReviews = async (eventId, organizerId) => {
    // 1. Verify event belongs to organizer
    const event = await EventRepo.fetchEventId(eventId, organizerId);
    if (!event) {
        throw new Error("Event not found or access denied");
    }

    // 2. Fetch reviews populated with attendee info
    const reviews = await Review.find({ event: eventId })
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 });

    return { event, reviews };
}