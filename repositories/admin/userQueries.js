import User from "../../models/users/user.js"

export const getAllUsers = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const query = search
        ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
        : {};

    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await User.countDocuments(query);
    return {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        search
    };
}

export const getUserById = async (id) => {
    return await User.findById(id).select('-password');
}

export const toggleUserStatus = async (id) => {
    const user = await User.findById(id).select('-password');
    if (!user) return null;
    const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
    return await User.findByIdAndUpdate(id, { status: newStatus }, { new: true }).select('-password');
}

export const deleteUserById = async (id) => {
    return await User.findByIdAndDelete(id);
}
