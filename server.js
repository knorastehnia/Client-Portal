const express = require('express')

const cookies = require('cookie-parser')
const auth = require('./routes/auth.js')

const app = express()
const port = process.env.PORT ?? 3000

app.use(express.json())
app.use(cookies())

app.use('/api/auth', auth)

app.listen(port, () => {
    console.log('Server running on port', Number(port))
})
