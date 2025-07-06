const rc = require("../stores/redis.js")

const check_admin_session = async (req, res, next) => {
    const session_id = req.cookies['session-id']
    const admin_id = await rc.get(`session:admin:${session_id}`)

    if (!admin_id) return res.status(401).send('Session expired or invalid')

    req.admin_id = admin_id
    next()
}

const check_client_session = async (req, res, next) => {
    const session_id = req.cookies['session-id']
    const client_id = await rc.get(`session:client:${session_id}`)

    if (!client_id) return res.status(401).send('Session expired or invalid')

    req.client_id = client_id
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
    check_admin_session,
    check_client_session,
    check_temp_session
}
