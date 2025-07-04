const rc = require("../stores/redis.js")

const check_session = async (req, res, next) => {
    const session_id = req.cookies['session-id']
    const user_id = await rc.get(`session:${session_id}`)

    if (!user_id) return res.status(401).send('Session expired or invalid')

    req.user_id = user_id
    next()
}

const check_temp_session = async (req, res, next) => {
    const session_id = req.cookies['session-id']
    const email = await rc.get(`temp-session:${session_id}`)

    if (!email) return res.status(401).send('Session expired or invalid')

    req.email = email
    next()
}

module.exports = {
    check_session,
    check_temp_session
}
