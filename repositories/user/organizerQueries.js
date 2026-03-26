import Organizer from "../../models/organizer/organizer.js";

export const createOrganizerProfile = async (userId, organizationName, registrationNumber, industryCategory, operatingRegion) => {
    const organizer = new Organizer({
        userId,
        organizationName,
        registrationNumber,
        industryCategory,
        operatingRegion,
        status: 'Pending'
    });
    return await organizer.save();
}

export const getOrganizerByUserId = async (userId) => {
    return await Organizer.findOne({ userId });
}
