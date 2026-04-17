import Organizer from "../../models/organizer/organizer.js";
import Event from '../../models/organizer/event.js'

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

/**
 * Finds an organizer document using the associated User's ID.
 * @param {string} userId - The _id of the User document.
 */
export const getOrganizerByUserId = async (userId) => {
    return await Organizer.findOne({ userId });
}

/**
 * Finds an organizer document by its own unique ID.
 * @param {string} organizerId - The _id of the Organizer document.
 */
export const getOrganizerById = async (organizerId) => {
    return await Organizer.findById(organizerId);
}

export const deleteOrganizerProfile = async (userId) => {
    return await Organizer.deleteOne({ userId });
}

/**
 * Updates an organizer profile using its specific Organizer ID.
 */
export const updateOrganizerProfile = async (organizerId, orgName, orgIndustry, orgRegion) => {
    return await Organizer.findByIdAndUpdate(
        organizerId,
        {
            $set: {
                organizationName: orgName,
                operatingRegion: orgRegion,
                industryCategory: orgIndustry
            }
        },
        { new: true }
    );
}

// Keeping a legacy alias for a smooth transition if needed, but we'll refactor callers.
export const update_Organizer = updateOrganizerProfile;
