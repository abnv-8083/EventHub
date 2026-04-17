import express from "express"
const router = express.Router()
import * as userController from "../../controller/users/userController.js"
// import isAuthenticated from "../../middleware/isAuthenticated.js"

router.get('/',userController.getHome)

router.get('/events',userController.getEvent)
router.get('/events/:id', userController.getEventDetails)
router.post('/events/:id/review', userController.postReview)
router.delete('/review/:id', userController.deleteReview)
router.get('/about',userController.getAbout)
router.get('/contact', userController.getContact)
router.get('/become-organizer', userController.getBecomeOrganizer)



export default router

