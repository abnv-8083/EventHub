import express from "express"
const router = express.Router()
import * as userController from "../../controller/users/userController.js"
import isAuthenticated from "../../middleware/isAuthenticated.js"
import {uploadAvatar} from "../../middleware/multer.js"

router.get('/profile', isAuthenticated, userController.getProfile)

router.post('/profile/edit', isAuthenticated, userController.editProfile)

router.post('/profile/avatar', isAuthenticated, uploadAvatar.single('avatar'), userController.updateAvatar)

router.get('/profile/edit/email', isAuthenticated, userController.getEditEmail)
router.post('/profile/edit/email', isAuthenticated, userController.editEmail)


router.get('/profile/edit/password', isAuthenticated, userController.getEditPassword)
router.post('/profile/edit/password', isAuthenticated, userController.editPassword)

// Booking Routes
router.get('/booking/:id', isAuthenticated, userController.getBookingPage)


export default router

