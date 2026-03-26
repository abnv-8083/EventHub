import express from 'express'
const router = express.Router()
import isOrganizerAuthenticated from '../../middleware/isOrganizerAuthenticated.js'
import * as organizerController from '../../controller/organizer/organizerController.js'

// Protect ALL organizer routes
router.use(isOrganizerAuthenticated)

router.get('/', (req, res) => {
    res.redirect('/organizer/dashboard')
})

router.route('/dashboard')
    .get(organizerController.getDashboard)

router.route('/profile')
    .get(organizerController.getProfile)
    .post(organizerController.postProfile)

export default router
