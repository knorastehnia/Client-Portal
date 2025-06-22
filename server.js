const express = require('express')
const app = express()
const port = process.env.PORT ?? 3000
const user = require('./routes/user.js')
const admin = require('./routes/admin.js')

app.use(express.json())
app.use('/api/user', user)
app.use('/api/admin', admin)

app.listen(port, () => {
    console.log('Server running on port', Number(port))
})
