const { session_store } = require("../stores/redis")

const check_session = (req, res, next) => {
    const session_id = req.cookies['session-id']
    const expiration = session_store[session_id]?.expiration

    // console.log(expiration)

    if (expiration === undefined || expiration < Date.now()) {
        return res.status(401).send('Session expired or invalid')
    }

    next()
}

module.exports = check_session
