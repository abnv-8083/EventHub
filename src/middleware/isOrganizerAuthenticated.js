import HTTP_STATUS from "../constants/statusCode.js"
import { sendResponse } from "../utils/responseHandler.js"
import User from "../models/users/user.js"

const isOrganizerAuthenticated = async (req, res, next) => {
    try {
        // 1. Check if ANY user is logged in
        if (!req.session || !req.session.user) {
            return res.redirect('/user/login');
        }

        // 2. Refresh user data to ensure up-to-date permissions
        const liveUser = await User.findById(req.session.user._id);
        
        if (!liveUser || liveUser.status !== 'Active') {
            delete req.session.user;
            return res.redirect('/user/login');
        }

        // 3. Verify Organizer privileges
        if (liveUser.isOrganizer) {
            // Update session with latest data just in case
            req.session.user = liveUser.toObject();
            return next();
        }

        // 4. Not an organizer? Send to registration
        return res.redirect('/user/organizer/register');
    } catch (error) {
        console.error("Organizer auth verification failed:", error);
        return res.redirect('/');
    }
}

export default isOrganizerAuthenticated
