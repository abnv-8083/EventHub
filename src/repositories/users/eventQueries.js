import Event from "../../models/organizer/event.js";

export const fetchFeaturedEvents = async (limit = 3) => {
    return await Event.find({ 
        status: { $in: ['Approved', 'Published'] }, 
        visibility: 'Public',
        isFeatured: true
    })
    .sort({ createdAt: -1 })
    .limit(limit);
}

export const fetchAllPublicEvents = async (filters = {}, sortOption = { createdAt: -1 }, skip = 0, limit = 9) => {
    return await Event.find({
        status: { $in: ['Approved', 'Published'] },
        visibility: 'Public',
        ...filters
    })
    .populate('organizerId', 'organizationName industryCategory')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);
}

export const countPublicEvents = async (filters = {}) => {
    return await Event.countDocuments({
        status: { $in: ['Approved', 'Published'] },
        visibility: 'Public',
        ...filters
    });
}

export const fetchEventById = async (id) => {
    return await Event.findById(id).populate('organizerId');
}

export const fetchEventWithFullDetails = async (id) => {
    return await Event.findById(id).populate('organizerId');
}
