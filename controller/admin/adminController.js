import * as adminQuery from "../../repositories/admin/adminQueries.js"
import * as organizerQuery from "../../repositories/admin/organizerQueries.js"
import * as userQuery from "../../repositories/admin/userQueries.js"
import HTTP_STATUS from "../../constants/statusCode.js"
import { sendResponse } from "../../utils/responseHandler.js"
export const getOrganizersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const { organizers, totalPages, currentPage } = await organizerQuery.getAllOrganizers(page, limit);
        res.render('admin/organizers', { organizers, totalPages, currentPage });
    } catch (error) {
        console.error("Error fetching organizers list:", error);
        res.render('admin/organizers', { organizers: [], totalPages: 1, currentPage: 1 });
    }
}

export const getAdminsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const { admins, totalPages, currentPage } = await adminQuery.getAllAdmins(page, limit);
        res.render('admin/admins', { admins, totalPages, currentPage });
    } catch (error) {
        console.error("Error fetching admins list:", error)
        res.render('admin/admins', { admins: [], totalPages: 1, currentPage: 1 });
    }
}

export const getDashboard = (req,res) =>{
    res.render('admin/dashboard')
}

export const getVerifyKyc = async (req, res) => {
    try {
        const { id } = req.params;
        const organizer = await organizerQuery.getOrganizerById(id);
        if (!organizer) return res.redirect('/admin/organizer');
        res.render('admin/verify-kyc', { organizer });
    } catch (error) {
        res.redirect('/admin/organizer');
    }
}

export const postApproveKyc = async (req, res) => {
    try {
        const { id } = req.params;
        const organizer = await organizerQuery.approveOrganizer(id);
        if (!organizer) return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, "Organizer application not found");
        
        return sendResponse(res, HTTP_STATUS.OK, true, "Organizer approved successfully. User now has creator access.", { redirect: '/admin/organizer' });
    } catch (error) {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to approve organizer");
    }
}

export const postRejectKyc = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const organizer = await organizerQuery.updateOrganizerStatus(id, 'Rejected', reason);
        if (!organizer) return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, "Organizer application not found");
        
        return sendResponse(res, HTTP_STATUS.OK, true, "Organizer application explicitly rejected.", { redirect: '/admin/organizer' });
    } catch (error) {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to reject organizer");
    }
}

export const getAdminView = async (req, res) => {
    try {
        const { id } = req.params;
        const adminData = await adminQuery.getAdminById(id);
        if (!adminData) return res.redirect('/admin/admins');
        res.render('admin/view-admin', { adminData });
    } catch (error) {
        res.redirect('/admin/admins');
    }
}

export const getAdminEdit = async (req, res) => {
    try {
        const { id } = req.params;
        const adminData = await adminQuery.getAdminById(id);
        if (!adminData) return res.redirect('/admin/admins');
        res.render('admin/edit-admin', { adminData });
    } catch (error) {
        res.redirect('/admin/admins');
    }
}

export const postAdminEdit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, notes } = req.body;
        // In a real application, you'd want Joi validation here
        if (!name || !email) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Name and Email are required");
        }
        await adminQuery.updateAdminDetails(id, name, email, notes);
        return sendResponse(res, HTTP_STATUS.OK, true, "Administrator updated successfully", { redirect: '/admin/admins' });
    } catch (error) {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to update administrator");
    }
}

export const postToggleBlockAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const adminData = await adminQuery.getAdminById(id);
        if (!adminData) return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, "Administrator not found");
        
        // Prevent superadmins from blocking themselves casually, though we removed department so everyone is equal.
        // We can just toggle Active <-> Blocked
        const newStatus = adminData.status === 'Active' ? 'Blocked' : 'Active';
        await adminQuery.updateAdminStatus(id, newStatus);
        
        return sendResponse(res, HTTP_STATUS.OK, true, `Administrator has been ${newStatus.toLowerCase()}`, { redirect: '/admin/admins' });
    } catch (error) {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to update status");
    }
}

export const postDeleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmed } = req.body;
        
        // Safety check to prevent deleting the active session admin
        if (req.session.admin && req.session.admin._id === id) {
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, "You cannot delete your own active account.");
        }

        // Two-stage confirmation handshake
        if (!confirmed) {
            return res.status(200).json({
                success: true,
                confirm: {
                    title: 'Delete Administrator',
                    message: 'Are you absolutely sure you want to permanently delete this administrator? This action cannot be undone.',
                    type: 'delete',
                    confirmText: 'Yes, Delete System Operator',
                    cancelText: 'Cancel'
                }
            });
        }

        const deleted = await adminQuery.deleteAdminById(id);
        if (!deleted) return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, "Administrator not found");
        
        return sendResponse(res, HTTP_STATUS.OK, true, "Administrator deleted successfully", { redirect: '/admin/admins' });
    } catch (error) {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to delete administrator");
    }
}

// ─── ADMIN PROFILE (self) ─────────────────────────────────────────────────────

export const getAdminProfile = async (req, res) => {
    try {
        const adminId = req.session.admin._id;
        const adminData = await adminQuery.getAdminById(adminId);
        res.render('admin/profile', { adminData });
    } catch (error) {
        res.redirect('/admin/dashboard');
    }
}

export const postAdminProfile = async (req, res) => {
    try {
        const adminId = req.session.admin._id;
        const { name, email, notes } = req.body;
        if (!name || !email) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Name and Email are required");
        }
        const updated = await adminQuery.updateAdminDetails(adminId, name, email, notes);
        // Sync session
        req.session.admin = { ...req.session.admin, name: updated.name, email: updated.email };
        return sendResponse(res, HTTP_STATUS.OK, true, "Profile updated successfully");
    } catch (error) {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to update profile");
    }
}

// ─── PLATFORM USER MANAGEMENT ─────────────────────────────────────────────────

export const getUsersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || '';
        const limit = 10;
        const { users, totalPages, currentPage } = await userQuery.getAllUsers(page, limit, search);
        res.render('admin/users', { users, totalPages, currentPage, search });
    } catch (error) {
        console.error("Error fetching users list:", error);
        res.render('admin/users', { users: [], totalPages: 1, currentPage: 1, search: '' });
    }
}

export const getUserView = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = await userQuery.getUserById(id);
        if (!userData) return res.redirect('/admin/users');
        res.render('admin/view-user', { userData });
    } catch (error) {
        res.redirect('/admin/users');
    }
}

export const postToggleBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await userQuery.toggleUserStatus(id);
        if (!updated) return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, "User not found");
        return sendResponse(res, HTTP_STATUS.OK, true, `User has been ${updated.status.toLowerCase()}`, { redirect: '/admin/users' });
    } catch (error) {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to update user status");
    }
}

export const postDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmed } = req.body;

        if (!confirmed) {
            return res.status(200).json({
                success: true,
                confirm: {
                    title: 'Delete User',
                    message: 'Are you sure you want to permanently delete this user account? All their data will be lost.',
                    type: 'delete',
                    confirmText: 'Yes, Delete User',
                    cancelText: 'Cancel'
                }
            });
        }

        const deleted = await userQuery.deleteUserById(id);
        if (!deleted) return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, "User not found");
        return sendResponse(res, HTTP_STATUS.OK, true, "User deleted successfully", { redirect: '/admin/users' });
    } catch (error) {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to delete user");
    }
}
