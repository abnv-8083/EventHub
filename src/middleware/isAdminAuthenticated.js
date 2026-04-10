import HTTP_STATUS from "../constants/statusCode.js"
import { sendResponse } from "../utils/responseHandler.js"
import Admin from "../models/admin/admin.js"

const isAdminAuthenticated = async (req, res, next) => {
    if (!req.session || !req.session.admin) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, 'Please authenticate as an administrator.', { redirect: '/admin/login' });
    }

    try {
        const admin = await Admin.findById(req.session.admin._id);
        if (!admin || admin.status !== 'Active') {
            req.session.destroy(err => {
                if (err) console.error('Admin session destroy error:', err);
            });
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, false, 'Admin account is blocked or inactive.', { redirect: '/admin/login' });
        }
        req.session.admin = admin.toObject();
        next();
    } catch (error) {
        console.error('Admin auth verification failed:', error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Authentication check failed.', { redirect: '/admin/login' });
    }
}

export default isAdminAuthenticated;
