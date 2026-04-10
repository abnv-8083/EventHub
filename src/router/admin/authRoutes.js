import express from 'express'
const router = express.Router()
import * as adminAuthController from '../../controller/admin/adminAuthController.js'
import * as adminController from '../../controller/admin/adminController.js'
import isAdminAuthenticated from '../../middleware/isAdminAuthenticated.js'

router.get('/',(req,res)=>{
    res.redirect('/admin/login')
})

router.route('/login')
    .get(adminAuthController.getAdminLogin)
    .post(adminAuthController.postAdminLogin)

router.route('/forgot-password')
    .get(adminAuthController.getAdminForgotPassword)
    .post(adminAuthController.postAdminForgotPassword)

router.route('/otp-verify')
    .get(adminAuthController.getAdminOTPVerify)
    .post(adminAuthController.postAdminOTPVerify)

router.route('/reset-password')
    .get(adminAuthController.getAdminResetPassword)
    .post(adminAuthController.postAdminResetPassword)

router.post('/logout', adminAuthController.postAdminLogout)

// Protect all admin routes following the login route
router.use(isAdminAuthenticated)

router.route('/register')
    .get(adminAuthController.getAdminRegister)
    .post(adminAuthController.postAdminRegister)

router.route('/dashboard')
    .get(adminController.getDashboard)

router.route('/admins')
    .get(adminController.getAdminsList)

router.route('/admins/view/:id')
    .get(adminController.getAdminView)

router.route('/admins/edit/:id')
    .get(adminController.getAdminEdit)
    .post(adminController.postAdminEdit)

router.route('/admins/toggle-block/:id')
    .post(adminController.postToggleBlockAdmin)

router.route('/admins/delete/:id')
    .post(adminController.postDeleteAdmin)

router.route('/organizer')
    .get(adminController.getOrganizersList)

router.route('/organizer/verify-kyc/:id')
    .get(adminController.getVerifyKyc)

router.route('/organizer/approve-kyc/:id')
    .post(adminController.postApproveKyc)

router.route('/organizer/reject-kyc/:id')
    .post(adminController.postRejectKyc)

router.route('/profile')
    .get(adminController.getAdminProfile)
    .post(adminController.postAdminProfile)

router.route('/users')
    .get(adminController.getUsersList)

router.route('/users/view/:id')
    .get(adminController.getUserView)

router.route('/users/toggle-block/:id')
    .post(adminController.postToggleBlockUser)

router.route('/users/delete/:id')
    .post(adminController.postDeleteUser)

export default router
