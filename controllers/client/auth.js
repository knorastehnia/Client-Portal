const crypto = require('crypto')
const argon2 = require('argon2')
const { db } = require('../../stores/postgres.js')
const { rc } = require('../../stores/redis.js')

const register = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const password = req.body.password
    const subdomain = req.body.subdomain

    try {
        // initial row must already exist through admin_invite_client
        const query_result = await db.one(`
            SELECT clients.pw_hash
            FROM clients
            JOIN admins ON clients.admin_id = admins.id
            WHERE clients.email=$1 AND admins.subdomain=$2
        `, [email, subdomain])

        if (query_result.pw_hash) throw new Error()

        const hash = await argon2.hash(password)

        await db.any(`
            INSERT INTO clients (email, pw_hash)
            VALUES ($1, $2)
        `, [email, hash])
    } catch (err) {
        console.log('Client registration failed\n', err)
        return res.status(401).send('Something went wrong')
    }

    return res.status(200).send('Account created Successfully')
}

const login = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const password = req.body.password
    const subdomain = req.body.subdomain
    let client_id = -1

    try {
        const query_result = await db.one(`
            SELECT clients.id, clients.pw_hash
            FROM clients
            JOIN admins ON clients.admin_id = admins.id
            WHERE clients.email=$1 AND admins.subdomain=$2
        `, [email, subdomain])

        client_id = query_result.id

        if (!query_result.pw_hash) throw new Error()

        const valid = await argon2.verify(query_result.pw_hash, password)
        if (!valid) throw new Error()
    } catch (err) {
        console.log('Client login failed\n', err)
        return res.status(401).send('Incorrect credentials')
    }

    const session_id = crypto.randomBytes(32).toString('hex')

    await rc.set(`session:client:${session_id}`, client_id, { EX: 7 * 24 * 60 * 60 }) // expire in 7 days

    res.cookie('session-id', session_id, { httpOnly: true, sameSite: 'strict' })
    return res.status(200).send('Logging in...')
}

module.exports = {
    register,
    login
}
