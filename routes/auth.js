const express = require('express')

const auth = require('../controllers/auth.js')
const session = require('../middleware/session.js')

const router = express.Router()

router.post('/signup', auth.signup)
router.post('/login', auth.login)
router.post('/forgot-password', auth.forgot_password)
router.post('/verify-otp', auth.verify_otp)
router.post('/reset-password', session.check_temp_session, auth.reset_password)

module.exports = router
