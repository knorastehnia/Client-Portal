const crypto = require('crypto')
const argon2 = require('argon2')
const db = require('../stores/postgres.js')
const { otp_store, session_store } = require('../stores/redis.js')


const signup = async (req, res) => {
    const email = req.body.email.toString().toLowerCase()
    const password = req.body.password

    try {
        const exists = await db.none(`
            SELECT email FROM clients
            WHERE email=$1;
        `, email)
    } catch (err) {
        return res.status(401).send('Something went wrong')
    }

    const hash = await argon2.hash(password)

    await db.any(`
        INSERT INTO clients (org_id, email, pw_hash) VALUES
        ($1, $2, $3);
    `, [1, email, hash])    // org_id is placeholder

    return res.status(200).send('Account created successfully')
}

const login = async (req, res) => {
    const email = req.body.email.toString().toLowerCase()
    const password = req.body.password

    try {
        const query_result = await db.one(`
            SELECT email, pw_hash FROM clients
            WHERE email=$1;
        `, email)

        const valid = await argon2.verify(query_result.pw_hash, password)
        if (!valid) throw new Error()
    } catch (err) {
        return res.status(401).send('Incorrect credentials')
    }

    const session_id = crypto.randomBytes(32).toString('hex')
    const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;    // 7 days

    session_store.session_id = { 'email': email, 'expiration': expiration }
    res.cookie('session-id', session_id, { httpOnly: true, sameSite: 'strict' })

    return res.status(200).send('Logging in...')
}

const forgot_password = async (req, res) => {
    const email = req.body.email.toString().toLowerCase()
    const otp = crypto.randomInt(100000, 1000000)

    const hash = await argon2.hash(String(otp))

    otp_store.set(email, hash)

    // email otp to provided email address

    res.status(200).send('A password reset link has been sent')
}

const verify_otp = async (req, res) => {
    const email = req.body.email.toString().toLowerCase()
    const otp = req.body.otp
    const stored_hash = otp_store.get(email)

    try {
        const valid = await argon2.verify(stored_hash, otp)
        if (!valid) throw new Error()
    } catch (err) {
        return res.status(401).send('Incorrect credentials')
    }

    const session_id = crypto.randomBytes(32).toString('hex')
    const expiration = Date.now() + 10 * 60 * 1000      // 10 minutes
    
    session_store[session_id] = { 'email': email, 'expiration': expiration }
    res.cookie('session-id', session_id, { httpOnly: true, sameSite: 'strict' })

    return res.status(200).send('One-time password verified')
}

const reset_password = async (req, res) => {
    const session_id = req.cookies['session-id']
    const email = session_store[session_id]?.email
    const new_password = req.body.password

    if (email === undefined) {
        return res.status(401).send('Something went wrong')
    }

    const hash = await argon2.hash(new_password)

    await db.none(`
        UPDATE clients SET pw_hash = $1
        WHERE email = $2;
    `, [hash, email])

    delete session_store[session_id]

    return res.status(200).send('Password updated successfully')
}

module.exports = {
    signup,
    login,
    forgot_password,
    verify_otp,
    reset_password
}
