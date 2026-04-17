import Events from '../../models/organizer/event.js'

export const fetchEvents = async (organizerId, filters = {}, sortOption = { createdAt: -1 }, page = 1, limit = 10) => {
    const query = { organizerId };
    
    if (filters.search) {
        query.title = { $regex: filters.search, $options: 'i' };
    }

    if (filters.status) {
        query.status = filters.status;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
        Events.find(query).sort(sortOption).skip(skip).limit(limit),
        Events.countDocuments(query)
    ]);

    return { events, total, totalPages: Math.ceil(total / limit) };
}

export const createEvent = async (eventData) => {
    const event = new Events(eventData)
    return await event.save()
}

export const fetchEventId = async (eventId, organizerId) => {
    return await Events.findOne({ _id: eventId, organizerId })
}

export const updateEventIfOrganizer = async (eventId, organizerId, updateData) => {
    return await Events.findOneAndUpdate({ _id: eventId, organizerId }, { $set: updateData }, { new: true })
}

export const deleteEventIfOrganizer = async (eventId, organizerId) => {
    return await Events.findOneAndDelete({ _id: eventId, organizerId })
}