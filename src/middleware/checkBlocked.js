import User from "../models/users/user.js"
import Admin from "../models/admin/admin.js"
import HTTP_STATUS from "../constants/statusCode.js"
import { sendResponse } from "../utils/responseHandler.js"

const clearUserOrganizerSession = (req) => {
    if (!req.session) return;
    delete req.session.user;
    delete req.session.organizer;
    if (req.session.passport) delete req.session.passport;
    req.user = null;
}

const clearAdminSession = (req) => {
    if (!req.session) return;
    delete req.session.admin;
    if (req.session.passport) delete req.session.passport;
    req.user = null;
}

const checkBlocked = async (req, res, next) => {
    try {
        const baseUrl = (req.baseUrl || '').toLowerCase();

        // ADMIN-only route guard
        if (baseUrl.startsWith('/admin')) {
            if (req.session && req.session.admin) {
                const dbAdmin = await Admin.findById(req.session.admin._id);
                if (!dbAdmin || dbAdmin.status !== 'Active') {
                    clearAdminSession(req);
                    const responseParams = { redirect: '/admin/login' };
                    if (req.session) {
                        return req.session.save(() => sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Admin account is blocked or inactive.', responseParams));
                    }
                    return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Admin account is blocked or inactive.', responseParams);
                }
                req.session.admin = dbAdmin.toObject();
                return next(); // Return here so we don't fall through to user check
            }

            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, 'Please authenticate as an administrator.', { redirect: '/admin/login' });
        }

        // ORGANIZER routes
        if (baseUrl.startsWith('/organizer')) {
            if (req.session && req.session.organizer) {
                const organizerUser = await User.findById(req.session.organizer._id);
                if (!organizerUser || organizerUser.status !== 'Active') {
                    clearUserOrganizerSession(req);
                    const responseParams = { redirect: '/' };
                    if (req.session) {
                        return req.session.save(() => sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your organizer account is blocked or inactive.', responseParams));
                    }
                    return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your organizer account is blocked or inactive.', responseParams);
                }
                req.session.organizer = organizerUser.toObject();
                return next();
            }
            if (req.session && req.session.user) {
                const organizerUser = await User.findById(req.session.user._id);
                if (!organizerUser || organizerUser.status !== 'Active') {
                    clearUserOrganizerSession(req);
                    const responseParams = { redirect: '/' };
                    if (req.session) {
                        return req.session.save(() => sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your account is blocked or inactive.', responseParams));
                    }
                    return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your account is blocked or inactive.', responseParams);
                }
                req.session.organizer = organizerUser.toObject();
                return next();
            }
            return res.redirect('/organizer/login');
        }

        // USER and PUBLIC routes (baseUrl is "" or starts with "/user")
        if (req.session && req.session.user) {
            const user = await User.findById(req.session.user._id);
            if (!user || user.status !== 'Active') {
                clearUserOrganizerSession(req);
                const responseParams = { redirect: '/' };
                if (req.session) {
                    return req.session.save(() => sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your account is blocked or inactive.', responseParams));
                }
                return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your account is blocked or inactive.', responseParams);
            }
            // keep session synchronized
            req.session.user = user.toObject();
        }

        if (req.session && req.session.organizer && !req.session.user) {
            const organizerUser = await User.findById(req.session.organizer._id);
            if (!organizerUser || organizerUser.status !== 'Active') {
                clearUserOrganizerSession(req);
                const responseParams = { redirect: '/' };
                if (req.session) {
                    return req.session.save(() => sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your organizer account is blocked or inactive.', responseParams));
                }
                return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your organizer account is blocked or inactive.', responseParams);
            }
            req.session.organizer = organizerUser.toObject();
        }

        next();
    } catch (error) {
        console.error('checkBlocked middleware error:', error);
        next();
    }
};

export default checkBlocked;
