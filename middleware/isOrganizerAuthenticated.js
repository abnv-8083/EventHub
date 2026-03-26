import HTTP_STATUS from "../constants/statusCode.js"
import { sendResponse } from "../utils/responseHandler.js"
import User from "../models/users/user.js"

const isOrganizerAuthenticated = async (req, res, next) => {
    try {
        // 1. Already has an Organizer session — fast path
        if (req.session && req.session.organizer) {
            const liveUser = await User.findById(req.session.organizer._id);
            if (liveUser && liveUser.isOrganizer) return next();
            delete req.session.organizer;
            return res.redirect('/organizer/login');
        }

        // 2. Auto-login: approved user coming from user portal (no separate organizer login needed)
        if (req.session && req.session.user) {
            const liveUser = await User.findById(req.session.user._id);
            if (liveUser && liveUser.isOrganizer) {
                req.session.organizer = liveUser.toObject();
                return next();
            }
            // User exists but not yet approved
            return res.redirect('/user/organizer/register');
        }

        // 3. No session at all
        return res.redirect('/organizer/login');
    } catch (error) {
        console.error("Organizer auth verification failed:", error);
        return res.redirect('/organizer/login');
    }
}

export default isOrganizerAuthenticated
