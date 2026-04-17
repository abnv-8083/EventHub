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

router.get('/admins/edit/:id', adminController.getAdminEdit)
router.post('/admins/edit/:id', adminController.postAdminEdit)
router.post('/admins/toggle-block/:id', adminController.postToggleBlockAdmin)
router.post('/admins/delete/:id', adminController.postDeleteAdmin)

// --- Events management ---
// router.get('/events', adminController.getEventsList) (Removed)
router.get('/events/view/:id', adminController.getEventView)
router.post('/events/approve/:id', adminController.postApproveEvent)
router.post('/events/reject/:id', adminController.postRejectEvent)
router.get('/approvals', adminController.getApprovalsDashboard)

// --- Categories management ---
router.get('/categories', adminController.getCategory)

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

router.route('/categories')
    .get(adminController.getCategory)
router.route('/categories/create')
    .get(adminController.getCreateCategory)
    .post(adminController.postCreateCategory)

router.route('/categories/delete/:id')
    .post(adminController.postDeleteCategory)

router.route('/categories/edit/:id')
    .post(adminController.postEditCategory)


export default router
