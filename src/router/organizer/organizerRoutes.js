import express from 'express'
const router = express.Router()
import isOrganizerAuthenticated from '../../middleware/isOrganizerAuthenticated.js'
import * as organizerController from '../../controller/organizer/organizerController.js'
import { uploadBanner } from '../../middleware/multer.js'

// Protect ALL organizer routes
router.use(isOrganizerAuthenticated)

router.get('/', (req, res) => {
    res.redirect('/organizer/dashboard')
})

router.route('/dashboard')
    .get(organizerController.getDashboard)

router.route('/profile')
    .get(organizerController.getProfile)
    .patch(organizerController.postProfile)

router.route('/event')
    .get(organizerController.getEventMangement)

router.route('/event/create')
    .get(organizerController.getCreateEvent)
    .post(uploadBanner.single('banner'),organizerController.postCreateEvent)

router.get('/event/:id/view', organizerController.getEventDetails)
router.get('/event/:id/reviews', organizerController.getEventReviews)
router.get('/event/:id/payment', organizerController.getEventPayment)
router.post('/event/:id/payment/payout', organizerController.postEventPayout)

router.route('/event/:id/edit')
    .get(organizerController.getEditEvent)
    .patch(uploadBanner.single('banner'), organizerController.postEditEvent)

router.delete('/event/:id', organizerController.deleteEvent)

export default router




