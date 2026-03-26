import Organizer from "../../models/organizer/organizer.js";
import User from "../../models/users/user.js";

export const getAllOrganizers = async (page = 1, limit = 10) => {
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

export const approveOrganizer = async (id) => {
    const organizer = await Organizer.findByIdAndUpdate(id, { status: 'Approved' }, { new: true });
    if (organizer) {
        await User.findByIdAndUpdate(organizer.userId, { isOrganizer: true, organizerId: organizer._id });
    }
    return organizer;
}

export const deleteOrganizerById = async (id) => {
    return await Organizer.findByIdAndDelete(id);
}
