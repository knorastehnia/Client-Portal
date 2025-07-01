const express = require('express')

const userAuth = require('../controllers/userAuth')
const session = require('../middleware/session.js')

const router = express.Router()

router.post('/signup', userAuth.signup)
router.post('/login', userAuth.login)
router.post('/forgot-password', userAuth.forgot_password)
router.post('/verify-otp', userAuth.verify_otp)
router.post('/reset-password', session.check_temp_session, userAuth.reset_password)

module.exports = router
