const express = require('express')
const userAuth = require('../controllers/userAuth')

const router = express.Router()

router.post('/signup', userAuth.signup)
router.post('/login', userAuth.login)
router.post('/forgot-password', userAuth.forgot_password)
router.post('/reset-password', userAuth.reset_password)

module.exports = router
