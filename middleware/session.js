const { session_store } = require("../stores/redis")

const check_session = (req, res, next) => {
    const session_id = req.cookies['session-id']
    const expiration = session_store.get(session_id)

    if (expiration === undefined || expiration < Date.now()) {
        if (req.originalUrl !== '/api/user/login') {
            return res.status(401).send('Session expired')
        }
    }

    console.log(session_id)

    next()
}

module.exports = check_session
