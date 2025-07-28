const express = require('express')

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

const project = require('../../controllers/admin/project.js')
const file = require('../../controllers/admin/file.js')
const session = require('../../middleware/session.js')

const router = express.Router()

router.use(session.check_session('login', 'admin'))

router.post('/create-project', project.create_project)
router.get('/get-project', project.get_project)
router.get('/get-project-headers', project.get_project_headers)
router.put('/update-project', project.update_project)
router.delete('/delete-project', project.delete_project)

router.put('/assign-client', project.assign_client)

router.put('/upload-file', upload.single('file'), file.upload_file)
router.get('/get-file', file.get_file)
router.delete('/delete-file', file.delete_file)

module.exports = router
