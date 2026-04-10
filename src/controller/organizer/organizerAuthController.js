import HTTP_STATUS from "../../constants/statusCode.js"
import * as userServices from "../../services/users/userAuthServices.js"
import { sendResponse } from "../../utils/responseHandler.js"
import { loginValidate } from "../../validation/user/user.js"

export const getLogin = (req, res) => {
    // If already logged in to organizer, redirect to dashboard
    if (req.session && req.session.organizer) {
        return res.redirect('/organizer/dashboard');
    }
    res.render('organizer/login')
}

export const postLogin = async (req, res) => {
    const { error, value } = loginValidate.validate(req.body, { abortEarly: false })
    if (error) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Please enter a valid email and password format");
    }
    
    try {
        const { email, password } = value;
        
        // 1. Verify standard credentials
        const userLogin = await userServices.loginUser(email, password);
        
        // 2. Add structural check for Organizer permission
        if (!userLogin.user.isOrganizer) {
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, "Access Denied. You do not hold verified Organizer privileges on this account.");
        }

        // 3. Assign an isolated session payload specifically for the Organizer portal
        req.session.organizer = userLogin.user;
        
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, "Organizer Authenticated", { redirect: '/organizer/dashboard' });
    } catch (error) {
        // userServices.loginUser throws generic HTTP errors on failure
        return sendResponse(res, error.statusCode || 500, false, error.message);
    }
}

export const postLogout = (req, res) => {
    const clearOrganizerSession = () => {
        if (req.session) {
            delete req.session.organizer;
            delete req.session.user;
            delete req.session.admin;
            if (req.session.passport) delete req.session.passport;
        }
        req.user = null;

        if (req.session) {
            req.session.save(err => {
                if (err) {
                    console.error("Organizer logout error:", err);
                    return sendResponse(res, 500, false, "Failed to sign out organizer");
                }
                return sendResponse(res, HTTP_STATUS.ACCEPTED, true, "Organizer log out successful", { redirect: '/' });
            });
        } else {
            return sendResponse(res, HTTP_STATUS.ACCEPTED, true, "Organizer log out successful", { redirect: '/' });
        }
    };

    if (typeof req.logout === 'function') {
        req.logout(err => {
            if (err) {
                console.error('Passport logout (organizer) error:', err);
            }
            clearOrganizerSession();
        });
    } else {
        clearOrganizerSession();
    }
}
