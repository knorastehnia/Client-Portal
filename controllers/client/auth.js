const crypto = require('crypto')
const argon2 = require('argon2')
const { db } = require('../../stores/postgres.js')
const { rc } = require('../../stores/redis.js')

const register = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const password = req.body.password
    const subdomain = req.hostname.split('.')[0]

    try {
        if (!email || !password) throw new Error()

        // initial row must already exist through admin invitation
        const query_result = await db.one(`
            SELECT clients.pw_hash FROM clients 
            JOIN admins ON clients.admin_id = admins.id
            WHERE clients.email = $1 AND admins.subdomain = $2
        `, [email, subdomain])

        // already registered if pw_hash is not null
        if (query_result.pw_hash) throw new Error()

        const hash = await argon2.hash(password)

        await db.any(`
            UPDATE clients SET pw_hash = $3
            FROM admins WHERE clients.admin_id = admins.id
            AND clients.email = $1 AND admins.subdomain = $2
        `, [email, subdomain, hash])
    } catch (err) {
        console.log('Client registration failed\n', err)
        return res.status(401).send('Something went wrong')
    }

    return res.status(200).send('Account created Successfully')
}

const login = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const password = req.body.password
    const subdomain = req.hostname.split('.')[0]
    let client_id = -1

    try {
        const query_result = await db.one(`
            SELECT clients.id, clients.pw_hash FROM clients
            JOIN admins ON clients.admin_id = admins.id
            WHERE clients.email = $1 AND admins.subdomain = $2
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

    await rc.set(`session:login:${subdomain}:client:${session_id}`, client_id, { EX: 7 * 24 * 60 * 60 }) // expire in 7 days

    res.cookie('session-id', session_id, { httpOnly: true, sameSite: 'strict' })
    return res.status(200).send('Logging in...')
}

const send_otp = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const subdomain = req.hostname.split('.')[0]
    const otp = crypto.randomInt(100000, 1000000)

    const hash = await argon2.hash(String(otp))

    await rc.set(`otp:${subdomain}:client:${email}`, hash, { EX: 300 })

    // email otp to provided email address
    console.log(otp)

    res.status(200).send('A password reset link has been sent')
}

const verify_otp = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const otp = req.body.otp
    const subdomain = req.hostname.split('.')[0]

    const stored_hash = await rc.get(`otp:${subdomain}:client:${email}`)

    try {
        const valid = await argon2.verify(stored_hash, otp)
        if (!valid) throw new Error()
    } catch (err) {
        console.log('Client otp verification failed\n', err)
        return res.status(401).send('Incorrect credentials')
    }

    const session_id = crypto.randomBytes(32).toString('hex')

    await rc.del(`otp:${subdomain}:client:${email}`)
    await rc.set(`session:pwreset:${subdomain}:client:${session_id}`, email, { EX: 600 })
    res.cookie('session-id', session_id, { httpOnly: true, sameSite: 'strict' })

    return res.status(200).send('One-time password verified')
}

const reset_password = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const new_password = req.body.password
    const session_id = req.cookies['session-id']
    const subdomain = req.hostname.split('.')[0]

    if (!new_password) return res.status(401).send('Something went wrong')

    const hash = await argon2.hash(new_password)

    await db.any(`
        UPDATE clients SET pw_hash = $3
        FROM admins WHERE clients.admin_id = admins.id
        AND clients.email = $1 AND admins.subdomain = $2
    `, [email, subdomain, hash])

    await rc.del(`session:pwreset:${subdomain}:client:${session_id}`)

    return res.status(200).send('Password updated successfully')
}

module.exports = {
    register,
    login,
    send_otp,
    verify_otp,
    reset_password
}
