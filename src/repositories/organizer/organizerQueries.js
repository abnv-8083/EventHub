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

export const getOrganizerById = async (userId) => {
    return await Organizer.findOne({ userId });
}

export const deleteOrganizerProfile = async (userId) => {
    return await Organizer.deleteOne({ userId });
}

export const findOrganizerById = async (userId,excludeField = '') =>{
    return await Organizer.findById({userId}).select(excludeField)
}