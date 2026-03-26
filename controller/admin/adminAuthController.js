import HTTP_STATUS from "../../constants/statusCode.js"
import * as adminAuthServices from "../../services/admin/adminAuthServices.js"
import { sendResponse } from "../../utils/responseHandler.js"
import { loginValidate, registerValidate } from "../../validation/admin/admin.js"

export const getAdminLogin = (req, res) => {
    res.render('auth/login-admin')
}

export const getAdminRegister = (req, res) => {
    res.render('admin/create-admin')
}

export const postAdminLogin = async (req, res) => {
    const { error, value } = loginValidate.validate(req.body, { abortEarly: false })
    if (error) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Please enter valid email and password")
    }
    try {
        const { email, password } = value
        const adminLogin = await adminAuthServices.loginAdmin(email, password)
        
        req.session.admin = adminLogin.admin;
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, adminLogin.message, { redirect: '/admin/dashboard' })
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}

export const postAdminRegister = async (req, res) => {
    const { error, value } = registerValidate.validate(req.body, { abortEarly: false })
    if (error) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.details[0].message)
    }
    try {
        const { name, email, password, notes } = value
        const newAdmin = await adminAuthServices.createAdmin(name, email, password, notes)
        if (newAdmin) {
            return sendResponse(res, HTTP_STATUS.CREATED, true, 'Admin Created Successfully.', {
                redirect: `/admin/admins`
            })
        }
    } catch (error) {
        console.error("Admin Registration Error:", error)
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}

export const postAdminLogout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error("Admin logout error:", err);
                return sendResponse(res, 500, false, "Failed to terminate admin session");
            }
            return sendResponse(res, HTTP_STATUS.ACCEPTED, true, "Admin logged out successfully", { redirect: '/admin/login' });
        });
    } else {
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, "Admin logged out successfully", { redirect: '/admin/login' });
    }
}
