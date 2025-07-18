const express = require('express')

const project = require('../../controllers/admin/project.js')
const session = require('../../middleware/session.js')

const router = express.Router()

router.use(session.check_session('login', 'admin'))

router.post('/create-project', project.create_project)
router.get('/get-project', project.get_project)
router.get('/get-project-headers', project.get_project_headers)
router.put('/update-project', project.update_project)
router.delete('/delete-project', project.delete_project)

router.put('/assign-client', project.assign_client)

module.exports = router
