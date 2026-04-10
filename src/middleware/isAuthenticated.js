import HTTP_STATUS from "../constants/statusCode.js"
import { sendResponse } from "../utils/responseHandler.js"
import User from "../models/users/user.js"

const isAuthenticated = async (req, res, next) => {
    if (!req.session || !req.session.user) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, 'Please login first.', { redirect: '/user/login' });
    }
    try {
        const user = await User.findById(req.session.user._id);
        if (!user || user.status !== 'Active') {
            // Clear only user data from session (do not destroy full session)
            if (req.session.user) {
                delete req.session.user;
            }
            if (req.session.organizer) {
                delete req.session.organizer;
            }
            // Ensure updated session is saved before response redirect
            return req.session.save((saveErr) => {
                if (saveErr) console.error('Session save error for blocked user:', saveErr);
                return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your account is blocked.', { redirect: '/' });
            });
        }

        // Keep session in sync with latest user status
        req.session.user = user.toObject();
        return req.session.save((saveErr) => {
            if (saveErr) {
                console.error('Session save error during auth sync:', saveErr);
            }
            return next();
        });
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Authentication check failed.', { redirect: '/' });
    }
}

export default isAuthenticated