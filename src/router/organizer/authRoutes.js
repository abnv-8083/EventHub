import express from 'express'
const router = express.Router()
import * as organizerAuthController from '../../controller/organizer/organizerAuthController.js'

router.route('/login')
    .get(organizerAuthController.getLogin)
    .post(organizerAuthController.postLogin)

router.route('/logout')
    .post(organizerAuthController.postLogout)

export default router
