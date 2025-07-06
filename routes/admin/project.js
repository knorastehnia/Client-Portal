const express = require('express')

const project = require('../../controllers/admin/project.js')
const session = require('../../middleware/session.js')

const router = express.Router()

router.post('/create-project', project.create_project)

module.exports = router
