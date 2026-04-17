import Event from '../../models/organizer/event.js';
import Organizer from '../../models/organizer/organizer.js';

/**
 * Fetch all events for Admins, strictly excluding 'Draft' status.
 * @param {number} page 
 * @param {number} limit 
 * @param {Object} filter 
 */
export const getAllEvents = async (page = 1, limit = 10, filter = {}) => {
    // Force exclusion of Draft events
    const query = { 
        ...filter, 
        status: { $nin: ['Draft'] } 
    };

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
        Event.find(query)
            .populate('organizerId', 'organizationName operatingRegion')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Event.countDocuments(query)
    ]);

    return {
        events,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalEvents: total
    };
};

/**
 * Get single event details for Admin review.
 * @param {string} id 
 */
export const getEventById = async (id) => {
    // Admin can only view if status is NOT Draft
    return await Event.findOne({ 
        _id: id, 
        status: { $ne: 'Draft' } 
    }).populate('organizerId', 'organizationName industryCategory operatingRegion');
};

/**
 * Update event status (Approve/Reject).
 * @param {string} id 
 * @param {string} status 
 * @param {string} rejectionReason 
 */
export const updateEventStatus = async (id, status, rejectionReason = null) => {
    const update = { status };
    if (rejectionReason) {
        update.rejectionReason = rejectionReason;
    }

    return await Event.findByIdAndUpdate(
        id, 
        { $set: update }, 
        { new: true }
    );
};

/**
 * Fetch all pending event submissions.
 */
export const getPendingEvents = async (filters = {}, sortOption = { createdAt: -1 }, page = 1, limit = 10) => {
    const query = { status: 'Pending' };

    if (filters.search) {
        // Find organizers whose organizationName matches the search
        const matchingOrganizers = await Organizer.find({
            organizationName: { $regex: filters.search, $options: 'i' }
        }).select('_id');
        
        const organizerIds = matchingOrganizers.map(org => org._id);

        query.$or = [
            { title: { $regex: filters.search, $options: 'i' } },
            { organizerId: { $in: organizerIds } }
        ];
    }

    if (filters.category) {
        query.category = filters.category;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
        Event.find(query)
            .populate('organizerId', 'organizationName industryCategory operatingRegion')
            .sort(sortOption)
            .skip(skip)
            .limit(limit),
        Event.countDocuments(query)
    ]);

    return { 
        pendingEvents: events, 
        total, 
        totalPages: Math.ceil(total / limit) 
    };
};

/**
 * Count all pending event submissions.
 */
export const countPendingEvents = async () => {
    return await Event.countDocuments({ status: 'Pending' });
};
