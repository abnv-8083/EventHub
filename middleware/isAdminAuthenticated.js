import HTTP_STATUS from "../constants/statusCode.js"
import { sendResponse } from "../utils/responseHandler.js"

const isAdminAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.admin) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, 'Please authenticate as an administrator.', { redirect: '/admin/login' });
    } else {
        next();
    }
}

export default isAdminAuthenticated;
