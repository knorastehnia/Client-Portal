const express = require('express')

const cookies = require('cookie-parser')
const user = require('./routes/user.js')
const admin = require('./routes/admin.js')

const app = express()
const port = process.env.PORT ?? 3000

app.use(express.json())
app.use(cookies())

app.use('/api/user', user)
app.use('/api/admin', admin)

app.listen(port, () => {
    console.log('Server running on port', Number(port))
})
