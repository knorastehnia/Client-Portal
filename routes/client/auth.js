const express = require('express')

const auth = require('../../controllers/admin/auth.js')
const session = require('../../middleware/session.js')

const router = express.Router()

router.post('/client/register', auth.register)
router.post('/client/login', auth.login)

module.exports = router
