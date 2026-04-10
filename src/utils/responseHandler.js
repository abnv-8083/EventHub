/**
 * @param {Object} res - Express response object
 * @param {Number} status - HTTP status code
 * @param {Boolean} success - Success flag
 * @param {String} message - Custom message
 * @param {Object} data - Optional extra data (e.g. redirect URL, user data)
 */
export const sendResponse = (res, status, success, message, data = {}) => {
    const req = res.req;
    const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || !req.headers.accept?.includes('text/html');

    if (isAjax) {
        return res.status(status).json({
            success,
            message,
            status, // Keeping it for now as per previous discussion, can be removed if strictly redundant
            ...data
        });
    } else {
        // Standard form submission or browser navigation
        if (success) {
            req.flash('success_msg', message);
        } else {
            req.flash('error_msg', message);
        }

        if (data.redirect) {
            return res.redirect(data.redirect);
        } else {
            // Redirect back to show the toast on the current page
            const referrer = req.get('Referrer') || '/';
            return res.redirect(referrer);
        }
    }
};

/**
 * Sends a confirmation request to the frontend AJAX handler
 * @param {Object} res - Express response object
 * @param {String} message - Message to display in the confirmation modal
 * @param {Object} options - Optional configuration (title, type, confirmText, cancelText)
 */
export const sendConfirmation = (res, message, options = {}) => {
    return res.status(200).json({
        confirm: {
            message,
            title: options.title || 'Confirm Action',
            type: options.type || 'confirm',
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel'
        }
    });
};
