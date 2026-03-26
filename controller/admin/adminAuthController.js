import HTTP_STATUS from "../../constants/statusCode.js"
import * as adminAuthServices from "../../services/admin/adminAuthServices.js"
import { sendResponse } from "../../utils/responseHandler.js"
import { loginValidate, registerValidate, forgotPasswordValidate, resetPasswordValidate } from "../../validation/admin/admin.js"

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

export const getAdminForgotPassword = (req, res) => {
    res.render('auth/forgot-password-admin')
}

export const postAdminForgotPassword = async (req, res) => {
    const { error, value } = forgotPasswordValidate.validate(req.body, { abortEarly: false })
    if (error) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Invalid Email")
    }
    try {
        const { email } = value
        await adminAuthServices.forgotPassword(email)
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, "OTP Sent Successfully", {
            redirect: `/admin/otp-verify?email=${email}&name=Admin&purpose=admin-reset-password`
        })
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}

export const getAdminOTPVerify = async (req, res) => {
    const { email, name, purpose } = req.query;
    // We don't have getOtpLockTime for admin yet, can add if needed, but 0 is fine for now
    res.render('auth/otp-verification-admin', { email, name, purpose, initialCooldown: 0 })
}

export const postAdminOTPVerify = async (req, res) => {
    try {
        const { email, otp, purpose } = req.body;
        await adminAuthServices.verifyOTP(email, otp);

        if (purpose === "admin-reset-password") {
            // Store email in session temporary to identify who is resetting
            req.session.resetEmail = email;
            return sendResponse(res, HTTP_STATUS.OK, true, "OTP Verified Successfully", { redirect: '/admin/reset-password' });
        }
        return sendResponse(res, HTTP_STATUS.OK, true, "OTP Verified Successfully", { redirect: '/admin/login' });
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.BAD_REQUEST, false, error.message);
    }
}

export const getAdminResetPassword = (req, res) => {
    if (!req.session.resetEmail) {
        return res.redirect('/admin/forgot-password');
    }
    res.render('auth/reset-password-admin')
}

export const postAdminResetPassword = async (req, res) => {
    const { error, value } = resetPasswordValidate.validate(req.body, { abortEarly: false })
    if (error) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.details[0].message)
    }
    try {
        const email = req.session.resetEmail;
        if (!email) {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, "Session expired, please try again")
        }
        const { password } = value
        await adminAuthServices.resetPassword(email, password)
        delete req.session.resetEmail;
        return sendResponse(res, HTTP_STATUS.OK, true, "Password Reset Successfully", { redirect: '/admin/login' })
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}
