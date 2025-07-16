const { rc } = require("../stores/redis.js")

const check_session = (session_type, role) => {
    return async (req, res, next) => {
        const session_id = req.cookies['session-id']
        const subdomain = req.hostname.split('.')[0]
        const user_id = await rc.get(`session:${session_type}:${subdomain}:${role}:${session_id}`)

        if (!user_id) return res.status(401).send('Session expired or invalid')

        req.user_id = user_id
        next()
    }
}

module.exports = {
    check_session
}
