const express = require('express')

const client = require('../../controllers/admin/client.js')
const session = require('../../middleware/session.js')

const router = express.Router()

router.use(session.check_session('login', 'admin'))

router.post('/create-client', client.create_client)
router.get('/get-client', client.get_client)
router.get('/get-client-headers', client.get_client_headers)
router.put('/update-client', client.update_client)
router.delete('/delete-client', client.delete_client)

module.exports = router
