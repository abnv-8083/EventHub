import * as passwordUtil from "../../utils/password.js"
import * as adminQuery from "../../repositories/admin/adminQueries.js"
import * as organizerQuery from "../../repositories/admin/organizerQueries.js"
import * as userQuery from "../../repositories/admin/userQueries.js"
import * as categoryQuery from "../../repositories/admin/categoriesQueries.js"
import * as eventQuery from "../../repositories/admin/eventQueries.js"
import * as adminPaymentRepo from '../../repositories/admin/paymentQueries.js';
import AppError from "../../utils/AppError.js"
import HTTP_STATUS from "../../constants/statusCode.js"
import { sendOrganizerCredentials } from "../../constants/sendEmail.js"
import crypto from "crypto"

export const fetchApprovalsDashboardData = async (filters = {}, page = 1, limit = 10) => {
    try {
        const { sort, ...restFilters } = filters;
        let sortOption = { createdAt: -1 }; // Default: Newest first

        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'alphabetical') sortOption = { title: 1 };

        const [eventsData, pendingOrganizers, categories] = await Promise.all([
            eventQuery.getPendingEvents(restFilters, sortOption, page, limit),
            organizerQuery.getPendingOrganizers(),
            categoryQuery.fetchAllCategories()
        ]);
        return { ...eventsData, pendingOrganizers, categories };
    } catch (error) {
        throw new AppError("Failed to fetch approvals data", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

/**
 * Fetch the total count of pending items (Events + Organizers).
 */
export const fetchPendingApprovalsCount = async () => {
    try {
        const count = await eventQuery.countPendingEvents();
        return count;
    } catch (error) {
        console.error("Error fetching pending counts:", error);
        return 0;
    }
}

// ─── EVENTS ───────────────────────────────────────────────────────────

export const fetchEventsList = async (page = 1, limit = 10, filter = {}) => {
    try {
        const result = await eventQuery.getAllEvents(page, limit, filter);
        return result;
    } catch (error) {
        throw new AppError("Failed to fetch events", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

export const fetchEventDetails = async (id) => {
    try {
        const event = await eventQuery.getEventById(id);
        if (!event) {
            throw new AppError("Event not found or access denied", HTTP_STATUS.NOT_FOUND);
        }
        return event;
    } catch (error) {
        throw error;
    }
}

export const approveEvent = async (id) => {
    try {
        const updated = await eventQuery.updateEventStatus(id, 'Approved');
        if (!updated) {
            throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
        }
        return updated;
    } catch (error) {
        throw error;
    }
}

export const rejectEvent = async (id, reason) => {
    try {
        if (!reason) {
            throw new AppError("Rejection reason is required", HTTP_STATUS.BAD_REQUEST);
        }
        const updated = await eventQuery.updateEventStatus(id, 'Rejected', reason);
        if (!updated) {
            throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
        }
        return updated;
    } catch (error) {
        throw error;
    }
}

// ─── CATEGORIES ───────────────────────────────────────────────────────

export const fetchCategories = async (search = {}) => {
    try {
        const categories = await categoryQuery.fetchAllCategories(search);
        return categories;
    } catch (error) {
        throw new AppError("Failed to fetch categories", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

export const getCategoryById = async (id) => {
    try {
        const category = await categoryQuery.getCategoryById(id);
        if (!category) {
            throw new AppError("Category not found", HTTP_STATUS.NOT_FOUND);
        }
        return category;
    } catch (error) {
        throw error;
    }
}

export const createNewCategory = async (categoryData) => {
    try {
        console.log("hi")
        const newCategory = await categoryQuery.createCategory(categoryData);
        return newCategory;
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError("Category name already exists", HTTP_STATUS.BAD_REQUEST);
        }
        throw new AppError("Failed to create category", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

export const updateCategory = async (id, categoryData) => {
    try {
        const {name, description, status, featured, color, icon} = categoryData
        const updatedCategory = await categoryQuery.updateCategory(id, name, description, status, featured, color, icon);
        if (!updatedCategory) {
            throw new AppError("Category not found", HTTP_STATUS.NOT_FOUND);
        }
        return updatedCategory;
    } catch (error) {
        throw error;
    }
}

export const deleteCategory = async (id) => {
    try {
        console.log(id)
        const deleted = await categoryQuery.deleteCategory(id);
        if (!deleted) {
            throw new AppError("Category not found", HTTP_STATUS.NOT_FOUND);
        }
        return deleted;
    } catch (error) {
        throw new AppError(`Server Error ${error}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

// ─── ORGANIZERS ───────────────────────────────────────────────────────

export const fetchOrganizersList = async (page = 1, limit = 10) => {
    try {
        const result = await organizerQuery.getAllOrganizers(page, limit);
        return result;
    } catch (error) {
        throw new AppError("Failed to fetch organizers", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

export const fetchOrganizerKyc = async (id) => {
    try {
        const organizer = await organizerQuery.getOrganizerById(id);
        if (!organizer) {
            throw new AppError("Organizer not found", HTTP_STATUS.NOT_FOUND);
        }
        return organizer;
    } catch (error) {
        throw error;
    }
}

export const approveOrganizerApplication = async (id) => {
    try {
        // Generate temporary password
        const tempPassword = crypto.randomBytes(12).toString('base64').replace(/\W/g, '').slice(0, 12);
        const hashedPassword = await passwordUtil.hashPassword(tempPassword);

        const organizer = await organizerQuery.approveOrganizer(id, hashedPassword);
        if (!organizer) {
            throw new AppError("Organizer application not found", HTTP_STATUS.NOT_FOUND);
        }

        // Send credentials via email
        try {
            const user = await userQuery.getUserById(organizer.userId);
            if (user && user.email) {
                await sendOrganizerCredentials({
                    email: user.email,
                    name: user.name,
                    password: tempPassword
                });
            }
        } catch (emailError) {
            console.error("Error sending organizer approval email:", emailError);
        }

        return organizer;
    } catch (error) {
        throw error;
    }
}

export const rejectOrganizerApplication = async (id, reason) => {
    try {
        const organizer = await organizerQuery.updateOrganizerStatus(id, 'Rejected', reason);
        if (!organizer) {
            throw new AppError("Organizer application not found", HTTP_STATUS.NOT_FOUND);
        }
        return organizer;
    } catch (error) {
        throw error;
    }
}

// ─── ADMINS ───────────────────────────────────────────────────────────

export const fetchAdminsList = async (page = 1, limit = 10) => {
    try {
        const result = await adminQuery.getAllAdmins(page, limit);
        return result;
    } catch (error) {
        throw new AppError("Failed to fetch admins", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

export const fetchAdminById = async (id) => {
    try {
        const admin = await adminQuery.getAdminById(id);
        if (!admin) {
            throw new AppError("Administrator not found", HTTP_STATUS.NOT_FOUND);
        }
        return admin;
    } catch (error) {
        throw error;
    }
}

export const updateAdminData = async (id, name, email, notes) => {
    try {
        if (!name || !email) {
            throw new AppError("Name and Email are required", HTTP_STATUS.BAD_REQUEST);
        }
        const updated = await adminQuery.updateAdminDetails(id, name, email, notes);
        return updated;
    } catch (error) {
        throw error;
    }
}

export const toggleAdminBlockStatus = async (id) => {
    try {
        const admin = await adminQuery.getAdminById(id);
        if (!admin) {
            throw new AppError("Administrator not found", HTTP_STATUS.NOT_FOUND);
        }

        const newStatus = admin.status === 'Active' ? 'Blocked' : 'Active';
        const updated = await adminQuery.updateAdminStatus(id, newStatus);
        return updated;
    } catch (error) {
        throw error;
    }
}

export const deleteAdminAccount = async (id, currentAdminId) => {
    try {
        if (id === currentAdminId.toString()) {
            throw new AppError("You cannot delete your own active account", HTTP_STATUS.FORBIDDEN);
        }

        const deleted = await adminQuery.deleteAdminById(id);
        if (!deleted) {
            throw new AppError("Administrator not found", HTTP_STATUS.NOT_FOUND);
        }
        return deleted;
    } catch (error) {
        throw error;
    }
}

export const updateAdminProfile = async (adminId, name, email, notes) => {
    try {
        if (!name || !email) {
            throw new AppError("Name and Email are required", HTTP_STATUS.BAD_REQUEST);
        }
        const updated = await adminQuery.updateAdminDetails(adminId, name, email, notes);
        return updated;
    } catch (error) {
        throw error;
    }
}

// ─── USERS ────────────────────────────────────────────────────────────

export const fetchUsersList = async (page = 1, limit = 10, search = '') => {
    try {
        // Seed demo users if empty
        await userQuery.createUsersIfEmpty();

        const result = await userQuery.getAllUsers(page, limit, search);
        return result;
    } catch (error) {
        throw new AppError("Failed to fetch users", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

export const fetchUserById = async (id) => {
    try {
        const user = await userQuery.getUserById(id);
        if (!user) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
        }
        return user;
    } catch (error) {
        throw error;
    }
}

export const toggleUserBlockStatus = async (id) => {
    try {
        const updated = await userQuery.toggleUserStatus(id);
        if (!updated) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
        }
        return updated;
    } catch (error) {
        throw error;
    }
}

export const deleteUserAccount = async (id) => {
    try {
        const deleted = await userQuery.deleteUserById(id);
        if (!deleted) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
        }
        return deleted;
    } catch (error) {
        throw error;
    }
}

export const fetchPaymentRequests = async (status = 'Pending') => {
    return await adminPaymentRepo.fetchPaymentsByStatus(status);
}
export const approvePayoutRequest = async (id, utr, adminId) => {
    const result = await adminPaymentRepo.approvePaymentById(id, utr, adminId);
    if (!result) throw new AppError('Payment request not found.', HTTP_STATUS.NOT_FOUND);
    return result;
}
export const rejectPayoutRequest = async (id, reason, adminId) => {
    if (!reason) throw new AppError('Rejection reason is required.', HTTP_STATUS.BAD_REQUEST);
    const result = await adminPaymentRepo.rejectPaymentById(id, reason, adminId);
    if (!result) throw new AppError('Payment request not found.', HTTP_STATUS.NOT_FOUND);
    return result;
}