import express from "express"
const router = express.Router()
import * as userController from "../../controller/users/userController.js"
import isAuthenticated from "../../middleware/isAuthenticated.js"
import {uploadAvatar} from "../../middleware/multer.js"

router.get('/profile', isAuthenticated, userController.getProfile)

router.patch('/profile/edit', isAuthenticated, userController.editProfile)

router.patch('/profile/avatar', isAuthenticated, uploadAvatar.single('avatar'), userController.updateAvatar)

router.get('/profile/edit/email', isAuthenticated, userController.getEditEmail)
router.patch('/profile/edit/email', isAuthenticated, userController.editEmail)


router.get('/profile/edit/password', isAuthenticated, userController.getEditPassword)
router.patch('/profile/edit/password', isAuthenticated, userController.editPassword)

// Booking Routes
router.get('/booking/:id', isAuthenticated, userController.getBookingPage)

// Wishlist Routes
router.post('/wishlist/toggle/:id', isAuthenticated, userController.toggleWishlist)
router.get('/wishlist', isAuthenticated, userController.getWishlist)

router.get('/bookings', isAuthenticated, userController.getMyBookings)
// Razorpay
router.post('/checkout', isAuthenticated, userController.postCheckout)
router.post('/verify-payment', isAuthenticated, userController.verifyPayment)
router.get('/payment-success/:id', isAuthenticated, userController.getPaymentSuccess)

// Cancellation & Refunds
router.get('/cancel-booking/:id', isAuthenticated, userController.getCancelBooking)
router.post('/cancel-booking/:id', isAuthenticated, userController.postCancelBooking)
router.get('/refund-status', isAuthenticated, userController.getRefundStatus)


export default router

