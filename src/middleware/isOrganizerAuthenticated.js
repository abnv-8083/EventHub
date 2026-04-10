import HTTP_STATUS from "../constants/statusCode.js"
import { sendResponse } from "../utils/responseHandler.js"
import User from "../models/users/user.js"

const isOrganizerAuthenticated = async (req, res, next) => {
    try {
        const redirectHome = () => res.redirect('/');

        // 1. Already has an Organizer session — fast path
        if (req.session && req.session.organizer) {
            const liveUser = await User.findById(req.session.organizer._id);
            if (!liveUser || liveUser.status !== 'Active') {
                if (req.session.user) delete req.session.user;
                if (req.session.organizer) delete req.session.organizer;
                return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your account is blocked or inactive.', { redirect: '/' });
            }
            if (liveUser.isOrganizer) {
                req.session.organizer = liveUser.toObject();
                return next();
            }
            delete req.session.organizer;
            return res.redirect('/organizer/login');
        }

        // 2. Auto-login: approved user coming from user portal
        if (req.session && req.session.user) {
            const liveUser = await User.findById(req.session.user._id);
            if (!liveUser || liveUser.status !== 'Active') {
                delete req.session.user;
                delete req.session.organizer;
                return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Your account is blocked or inactive.', { redirect: '/' });
            }
            if (liveUser.isOrganizer) {
                req.session.organizer = liveUser.toObject();
                return next();
            }
            return res.redirect('/user/organizer/register');
        }

        // 3. No session at all
        return res.redirect('/organizer/login');
    } catch (error) {
        console.error("Organizer auth verification failed:", error);
        return redirectHome();
    }
}

export default isOrganizerAuthenticated
