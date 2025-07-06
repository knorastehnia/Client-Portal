const express = require('express')

const cookies = require('cookie-parser')
const admin_auth = require('./routes/admin/auth.js')
const client_auth = require('./routes/client/auth.js')

const app = express()
const port = process.env.PORT ?? 3000

app.use(express.json())
app.use(cookies())

app.use('/api/admin/auth', admin_auth)
app.use('/api/client/auth', client_auth)

app.listen(port, () => {
    console.log('Server running on port', Number(port))
})
