import Admin from "../../models/admin/admin.js"

export const checkByEmail = async (email) => {
    return await Admin.findOne({ email })
}

export const createAdminData = async (name, email, hashPass, notes) => {
    const admin = new Admin({
        name,
        email,
        password: hashPass,
        notes
    })
    return await admin.save()
}

export const getAllAdmins = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Admin.countDocuments();
    return {
        admins,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    };
}

export const getAdminById = async (id) => {
    return await Admin.findById(id).select('-password');
}

export const updateAdminDetails = async (id, name, email, notes) => {
    return await Admin.findByIdAndUpdate(id, { name, email, notes }, { new: true }).select('-password');
}

export const updateAdminStatus = async (id, status) => {
    return await Admin.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
}

export const deleteAdminById = async (id) => {
    return await Admin.findByIdAndDelete(id);
}

export const updateAdminPassword = async (id, hashPassword) => {
    return await Admin.findByIdAndUpdate(id, { $set: { password: hashPassword } }, { new: true });
}
