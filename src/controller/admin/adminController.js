import * as adminService from "../../services/admin/adminServices.js"
import HTTP_STATUS from "../../constants/statusCode.js"
import { sendResponse } from "../../utils/responseHandler.js"

// ─── CATEGORIES ───────────────────────────────────────────────────────

export const getCategory = async (req, res) => {
    try {
        const search = req.query.search;
        const categories = await adminService.fetchCategories(search);
        res.render('admin/categories', { categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to load categories");
    }
}

export const getCreateCategory = (req, res) => {
    res.render('admin/create-category');
}

export const postCreateCategory = async (req, res) => {
    try {
        const categoryData = req.body;
        await adminService.createNewCategory(categoryData);
        return sendResponse(res, HTTP_STATUS.CREATED, true, "Category created successfully", { redirect: '/admin/categories' });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const getEditCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await adminService.getCategoryById(id);
        res.render('admin/edit-category', { category });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const postEditCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryData = req.body;
        await adminService.updateCategory(id, categoryData);
        return sendResponse(res, HTTP_STATUS.OK, true, "Category updated successfully", { redirect: '/admin/categories' });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const postDeleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await adminService.deleteCategory(id);
        return sendResponse(res, HTTP_STATUS.OK, true, "Category deleted successfully", { redirect: '/admin/categories' });
    } catch (error) {
        console.log(error)
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

// ─── ORGANIZERS ───────────────────────────────────────────────────────

export const getOrganizersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const { organizers, totalPages, currentPage } = await adminService.fetchOrganizersList(page, limit);
        res.render('admin/organizers', { organizers, totalPages, currentPage });
    } catch (error) {
        console.error("Error fetching organizers:", error);
        res.render('admin/organizers', { organizers: [], totalPages: 1, currentPage: 1 });
    }
}

export const getVerifyKyc = async (req, res) => {
    try {
        const { id } = req.params;
        const organizer = await adminService.fetchOrganizerKyc(id);
        res.render('admin/verify-kyc', { organizer });
    } catch (error) {
        res.redirect('/admin/organizer');
    }
}

export const postApproveKyc = async (req, res) => {
    try {
        const { id } = req.params;
        await adminService.approveOrganizerApplication(id);
        return sendResponse(res, HTTP_STATUS.OK, true, "Organizer approved successfully", { redirect: '/admin/organizer' });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const postRejectKyc = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        await adminService.rejectOrganizerApplication(id, reason);
        return sendResponse(res, HTTP_STATUS.OK, true, "Organizer application rejected", { redirect: '/admin/organizer' });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

// ─── ADMINS ───────────────────────────────────────────────────────────

export const getAdminsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const { admins, totalPages, currentPage } = await adminService.fetchAdminsList(page, limit);
        res.render('admin/admins', { admins, totalPages, currentPage });
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.render('admin/admins', { admins: [], totalPages: 1, currentPage: 1 });
    }
}

export const getAdminView = async (req, res) => {
    try {
        const { id } = req.params;
        const adminData = await adminService.fetchAdminById(id);
        res.render('admin/view-admin', { adminData });
    } catch (error) {
        res.redirect('/admin/admins');
    }
}

export const getAdminEdit = async (req, res) => {
    try {
        const { id } = req.params;
        const adminData = await adminService.fetchAdminById(id);
        res.render('admin/edit-admin', { adminData });
    } catch (error) {
        res.redirect('/admin/admins');
    }
}

export const postAdminEdit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, notes } = req.body;
        await adminService.updateAdminData(id, name, email, notes);
        return sendResponse(res, HTTP_STATUS.OK, true, "Administrator updated successfully", { redirect: '/admin/admins' });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.BAD_REQUEST, false, error.message);
    }
}

export const postToggleBlockAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await adminService.toggleAdminBlockStatus(id);
        return sendResponse(res, HTTP_STATUS.OK, true, `Administrator has been ${updated.status.toLowerCase()}`, { redirect: '/admin/admins' });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const postDeleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmed } = req.body;

        if (!confirmed) {
            return res.status(200).json({
                success: true,
                confirm: {
                    title: 'Delete Administrator',
                    message: 'Are you absolutely sure you want to permanently delete this administrator?',
                    type: 'delete',
                    confirmText: 'Yes, Delete',
                    cancelText: 'Cancel'
                }
            });
        }

        await adminService.deleteAdminAccount(id, req.session.admin._id);
        return sendResponse(res, HTTP_STATUS.OK, true, "Administrator deleted successfully", { redirect: '/admin/admins' });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const getAdminProfile = async (req, res) => {
    try {
        const adminId = req.session.admin._id;
        const adminData = await adminService.fetchAdminById(adminId);
        res.render('admin/profile', { adminData });
    } catch (error) {
        res.redirect('/admin/dashboard');
    }
}

export const postAdminProfile = async (req, res) => {
    try {
        const adminId = req.session.admin._id;
        const { name, email, notes } = req.body;
        const updated = await adminService.updateAdminProfile(adminId, name, email, notes);
        req.session.admin = { ...req.session.admin, name: updated.name, email: updated.email };
        return sendResponse(res, HTTP_STATUS.OK, true, "Profile updated successfully");
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.BAD_REQUEST, false, error.message);
    }
}

// ─── USERS ────────────────────────────────────────────────────────────

export const getUsersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || '';
        const limit = 10;
        const { users, totalPages, currentPage } = await adminService.fetchUsersList(page, limit, search);
        res.render('admin/users', { users, totalPages, currentPage, search });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.render('admin/users', { users: [], totalPages: 1, currentPage: 1, search: '' });
    }
}

export const getUserView = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = await adminService.fetchUserById(id);
        res.render('admin/view-user', { userData });
    } catch (error) {
        res.redirect('/admin/users');
    }
}

export const postToggleBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await adminService.toggleUserBlockStatus(id);
        return sendResponse(res, HTTP_STATUS.OK, true, `User has been ${updated.status.toLowerCase()}`, { redirect: `/admin/users?search=${updated.email}` });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
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
                    message: 'Are you sure you want to permanently delete this user account?',
                    type: 'delete',
                    confirmText: 'Yes, Delete User',
                    cancelText: 'Cancel'
                }
            });
        }

        await adminService.deleteUserAccount(id);
        return sendResponse(res, HTTP_STATUS.OK, true, "User deleted successfully", { redirect: '/admin/users' });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message);
    }
}

export const getDashboard = (req, res) => {
    res.render('admin/dashboard');
}