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

export const getUsersCount = async (query = {}) => {
    return await User.countDocuments(query);
}

export const createUsersIfEmpty = async () => {
    const existing = await User.estimatedDocumentCount();
    if (existing > 0) return;

    const demoUsers = [
        { name: 'Alice Brown', email: 'alice@example.com', phone: 9876543210, password: 'password1', status: 'Active' },
        { name: 'Bob Smith', email: 'bob@example.com', phone: 9876543211, password: 'password1', status: 'Active' },
        { name: 'Carol Jones', email: 'carol@example.com', phone: 9876543212, password: 'password1', status: 'Active' },
        { name: 'David Green', email: 'david@example.com', phone: 9876543213, password: 'password1', status: 'Active' },
        { name: 'Eve White', email: 'eve@example.com', phone: 9876543214, password: 'password1', status: 'Active' },
        { name: 'Frank Black', email: 'frank@example.com', phone: 9876543215, password: 'password1', status: 'Active' },
        { name: 'Grace Yellow', email: 'grace@example.com', phone: 9876543216, password: 'password1', status: 'Active' },
        { name: 'Heidi Blue', email: 'heidi@example.com', phone: 9876543217, password: 'password1', status: 'Active' },
        { name: 'Ivan Gray', email: 'ivan@example.com', phone: 9876543218, password: 'password1', status: 'Active' },
        { name: 'Judy Red', email: 'judy@example.com', phone: 9876543219, password: 'password1', status: 'Active' }
    ];

    await User.insertMany(demoUsers.map(u => ({ ...u, isGoogle: false, avatar_url: 'https://www.svgrepo.com/show/418973/avatar-people-profile.svg' })));
};

