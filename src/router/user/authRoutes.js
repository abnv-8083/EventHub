import express from "express"
const router = express.Router()
import passport from "passport"
import * as userAuthController from "../../controller/users/userAuthController.js"
import * as userController from "../../controller/users/userController.js"
import isAuthenticated from "../../middleware/isAuthenticated.js"



router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], keepSessionInfo: true })
);

router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/user/login',
        failureFlash: true,
        keepSessionInfo: true
    }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect('/');
    }
);


router.route('/login')
    .get(userAuthController.getLogin)
    .post(userAuthController.postLogin)


router.route('/signup')
    .get(userAuthController.getRegister)
    .post(userAuthController.postRegister)


router.post('/logout', userAuthController.postLogout)

router.route('/otp-verify')
    .get(userAuthController.getOTPVerify)
    .post(userAuthController.postOTPVerify)


router.post('/otp-resend', userAuthController.postresendOtp)


router.route('/forgot-password')
    .get(userAuthController.getForgotePassword)
    .post(userAuthController.postforgotePassword)

router.route('/reset-password')
    .get(userAuthController.getRsetPassword)
    .post(userAuthController.postResetPassword)

router.route('/organizer/register')
    .get(isAuthenticated, userAuthController.getOrganizerSignup)
    .post(isAuthenticated, userController.postRegisterOrganizer)

router.post('/organizer/retry', isAuthenticated, userController.postRetryOrganizer)

router.route('/organizer/login')
    .get(userAuthController.getOrganizerLogin)

router.get('/email-verify-success', userAuthController.getEmailVerified)
export default router






