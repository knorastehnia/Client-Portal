const express = require('express')
const adminAuth = require('../controllers/adminAuth')

const router = express.Router()

router.post('/signup', adminAuth.signup)
router.post('/login', adminAuth.login)

module.exports = router
