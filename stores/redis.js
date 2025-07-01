const { createClient } = require('redis')

const rc = createClient({
    socket: {
        host: process.env.RC_HOST,
        port: process.env.RC_PORT
    }
})

rc.on('error', (err) => {console.log('Redis client error', err)})

;(async () => {
    await rc.connect()
})()

module.exports = rc
