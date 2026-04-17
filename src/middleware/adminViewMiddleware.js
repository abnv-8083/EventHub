import * as adminService from '../services/admin/adminServices.js';

/**
 * Middleware to provide global data to all admin views.
 */
const adminViewMiddleware = async (req, res, next) => {
    try {
        // Only fetch if it's an admin route
        if (req.path.startsWith('/admin') || req.originalUrl.startsWith('/admin')) {
            const count = await adminService.fetchPendingApprovalsCount();
            res.locals.pendingApprovalsCount = count;
        }
    } catch (error) {
        console.error("Error in adminViewMiddleware:", error);
        res.locals.pendingApprovalsCount = 0;
    }
    next();
};

export default adminViewMiddleware;
