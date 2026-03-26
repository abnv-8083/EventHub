const toast = (req, res, next) => {
    // Collect flash messages (req.flash returns an array)
    const errorFlash = req.flash('error');
    const errorMsgFlash = req.flash('error_msg');
    const successFlash = req.flash('success_msg');

    if (errorFlash.length > 0 || errorMsgFlash.length > 0) {
        console.log("Flash Error Detected:", errorFlash, errorMsgFlash);
    }

    // Assign to locals (prefer the first message if available)
    res.locals.error_msg = errorMsgFlash.length > 0 ? errorMsgFlash[0] : (errorFlash.length > 0 ? errorFlash[0] : null);
    res.locals.success_msg = successFlash.length > 0 ? successFlash[0] : null;

    // Passport puts the user in req.user, local login puts it in req.session.user
    res.locals.user = req.user || req.session.user || null;
    // Expose admin and organizer sessions as separate EJS locals
    res.locals.admin = req.session.admin || null;
    res.locals.organizer = req.session.organizer || null;
    next();
};

export default toast;
