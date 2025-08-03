const express = require('express')
const cookies = require('cookie-parser')
const cors = require('cors')
const admin_auth = require('./routes/admin/auth.js')
const admin_project = require('./routes/admin/project.js')
const admin_client = require('./routes/admin/client.js')
const client_auth = require('./routes/client/auth.js')

const app = express()

app.use(cors({
    origin: /^https?:\/\/([a-zA-Z0-9-]+\.)*localhost:4000$/
}))
app.use(express.json())
app.use(cookies())

app.use('/api/admin/auth', admin_auth)
app.use('/api/admin/project', admin_project)
app.use('/api/admin/client', admin_client)
app.use('/api/client/auth', client_auth)

module.exports = app
