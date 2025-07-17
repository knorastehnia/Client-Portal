const crypto = require('crypto')
const argon2 = require('argon2')
const { db } = require('../../stores/postgres.js')
const { rc } = require('../../stores/redis.js')


const register = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const password = req.body.password
    const subdomain = req.body.subdomain

    try {
        if (!email || !password) throw new Error()

        await db.none(`
            SELECT email FROM admins
            WHERE email = $1
        `, [email])

        const hash = await argon2.hash(password)

        await db.any(`
            INSERT INTO admins (email, pw_hash, subdomain)
            VALUES ($1, $2, $3)
        `, [email, hash, subdomain])
    } catch (err) {
        console.log('Admin registration failed\n', err)
        return res.status(401).send('Something went wrong')
    }

    return res.status(200).send('Account created successfully')
}

const login = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const password = req.body.password
    const subdomain = req.hostname.split('.')[0]
    let admin_id = -1

    try {
        const query_result = await db.one(`
            SELECT id, pw_hash FROM admins
            WHERE email = $1 AND subdomain = $2
        `, [email, subdomain])

        admin_id = query_result.id

        const valid = await argon2.verify(query_result.pw_hash, password)
        if (!valid) throw new Error()
    } catch (err) {
        console.log('Admin login failed\n', err)
        return res.status(401).send('Incorrect credentials')
    }

    const session_id = crypto.randomBytes(32).toString('hex')

    await rc.set(`session:login:${subdomain}:admin:${session_id}`, admin_id, { EX: 7 * 24 * 60 * 60 }) // expire in 7 days

    res.cookie('session-id', session_id, { httpOnly: true, sameSite: 'strict' })
    return res.status(200).send('Logging in...')
}

const invite_client = async (req, res) => {
    const client_email = String(req.body.client_email).toLowerCase()
    const admin_id = req.admin_id

    try {
        // UNIQUE (admin_id, client)
        await db.any(`
            INSERT INTO clients (admin_id, email) VALUES
            ($1, $2)
        `, [admin_id, client_email])
    } catch (err) {
        console.log('Admin invite client failed\n', err)
        return res.status(401).send('Client already exists')
    }

    return res.status(200).send('Client invited')
}

const send_otp = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const subdomain = req.hostname.split('.')[0]
    const otp = crypto.randomInt(100000, 1000000)

    const hash = await argon2.hash(String(otp))

    await rc.set(`otp:${subdomain}:admin:${email}`, hash, { EX: 300 })

    // email otp to provided email address
    console.log(otp)

    res.status(200).send('A password reset link has been sent')
}

const verify_otp = async (req, res) => {
    const email = String(req.body.email).toLowerCase()
    const otp = req.body.otp
    const subdomain = req.hostname.split('.')[0]

    const stored_hash = await rc.get(`otp:${subdomain}:admin:${email}`)

    try {
        const valid = await argon2.verify(stored_hash, otp)
        if (!valid) throw new Error()
    } catch (err) {
        console.log('Admin otp verification failed\n', err)
        return res.status(401).send('Incorrect credentials')
    }

    const session_id = crypto.randomBytes(32).toString('hex')

    await rc.del(`otp:${subdomain}:admin:${email}`)
    await rc.set(`session:pwreset:${subdomain}:admin:${session_id}`, email, { EX: 600 })
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
        UPDATE admins SET pw_hash = $1
        WHERE email = $2
    `, [hash, email])

    await rc.del(`session:pwreset:${subdomain}:admin:${session_id}`)

    return res.status(200).send('Password updated successfully')
}

module.exports = {
    register,
    login,
    invite_client,
    send_otp,
    verify_otp,
    reset_password
}
