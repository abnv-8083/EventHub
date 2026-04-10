const toast = (req, res, next) => {
    const hasFlash = typeof req.flash === 'function';

    const errorFlash = hasFlash ? req.flash('error') : [];
    const errorMsgFlash = hasFlash ? req.flash('error_msg') : [];
    const successFlash = hasFlash ? req.flash('success_msg') : [];

    if (errorFlash.length > 0 || errorMsgFlash.length > 0) {
        console.log('Flash Error Detected:', errorFlash, errorMsgFlash);
    }

    res.locals.error_msg = errorMsgFlash.length > 0 ? errorMsgFlash[0]
        : (errorFlash.length > 0 ? errorFlash[0] : null);
    res.locals.success_msg = successFlash.length > 0 ? successFlash[0] : null;

    // Prefer explicit session values over passport user, so logout clears immediately
    res.locals.user = (req.session && req.session.user) || req.user || null;
    res.locals.admin = (req.session && req.session.admin) || null;
    res.locals.organizer = (req.session && req.session.organizer) || null;

    next();
};

export default toast;
