const { db } = require('../stores/postgres.js')
const { rc } = require('../stores/redis.js')

const check_session = (session_type, role) => {
    return async (req, res, next) => {
        const session_id = req.cookies['session-id']
        const subdomain = req.hostname.split('.')[0]
        const user_id = await rc.get(`session:${session_type}:${subdomain}:${role}:${session_id}`)

        if (!user_id) return res.status(401).send('Session expired or invalid')

        if (role === 'client') {
            const query_result = await db.one(`
                SELECT id FROM admins
                WHERE subdomain = $1
            `, [subdomain])

            req.admin_id = query_result.id
            req.client_id = user_id
        } else if (role === 'admin') {
            req.admin_id = user_id
        }

        next()
    }
}

module.exports = {
    check_session
}
