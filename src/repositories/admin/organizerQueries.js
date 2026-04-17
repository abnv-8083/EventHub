import Organizer from "../../models/organizer/organizer.js";
import User from "../../models/users/user.js";

export const getAllOrganizers = async (page = 1, limit = 2) => {
    const skip = (page - 1) * limit;
    const organizers = await Organizer.find()
        .populate('userId', 'email name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    const total = await Organizer.countDocuments();
    return {
        organizers,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    };
}

export const getOrganizerById = async (id) => {
    return await Organizer.findById(id).populate('userId', 'email name');
}

export const updateOrganizerStatus = async (id, status, rejectionReason = null) => {
    return await Organizer.findByIdAndUpdate(
        id, 
        { status, rejectionReason }, 
        { new: true }
    );
}

export const approveOrganizer = async (id, hashedPassword = null) => {
    const updateFields = { status: 'Approved' };
    if (hashedPassword) {
        updateFields.hashedPassword = hashedPassword;
    }

    const organizer = await Organizer.findByIdAndUpdate(id, updateFields, { new: true });
    if (organizer) {
        const userUpdate = { isOrganizer: true, organizerId: organizer._id };
        if (hashedPassword) {
            userUpdate.password = hashedPassword;
        }
        await User.findByIdAndUpdate(organizer.userId, userUpdate);
    }
    return organizer;
}

export const deleteOrganizerById = async (id) => {
    return await Organizer.findByIdAndDelete(id);
}

/**
 * Fetch all pending KYC organizations.
 */
export const getPendingOrganizers = async () => {
    return await Organizer.find({ status: 'Pending' }).populate('userId', 'email name');
}

/**
 * Count all pending KYC organizations.
 */
export const countPendingOrganizers = async () => {
    return await Organizer.countDocuments({ status: 'Pending' });
}
