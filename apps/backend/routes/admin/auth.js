const express = require('express')

const auth = require('../../controllers/admin/auth.js')
const session = require('../../middleware/session.js')

const router = express.Router()

router.post('/register', auth.register)
router.post('/login', auth.login) // TODO prevent logged in users from logging in again
router.post('/logout', session.check_session('login', 'admin'), auth.logout)

router.post('/forgot-password', auth.send_otp)
router.post('/verify-otp', auth.verify_otp)
router.post('/reset-password', session.check_session('pwreset', 'admin'), auth.reset_password)

module.exports = router
