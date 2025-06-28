const argon2 = require('argon2')
const db = require('../db.js')
const crypto = require('crypto')

const signup = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    try {
        const exists = await db.none(`
            SELECT email FROM clients
            WHERE email=$1;
        `, email)
    } catch (err) {
        return res.status(401).send('Account already exists')
    }

    const hash = await argon2.hash(password)

    await db.any(`
        INSERT INTO clients (org_id, email, pw_hash) VALUES
        ($1, $2, $3);
    `, [1, email, hash])    // org_id is placeholder

    return res.status(200).send('Account created successfully')
}

const login = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    try {
        const query_result = await db.one(`
            SELECT email, pw_hash FROM clients
            WHERE email=$1
        `, email)

        const valid = await argon2.verify(query_result.pw_hash, password)
        if (!valid) throw new Error()
    } catch (err) {
        return res.status(401).send('Incorrect credentials')
    }

    return res.status(200).send('Logging in...')
}

// placeholder otp store, replace with redis cache
let otp_store = new Map()

const forgot_password = async (req, res) => {
    const email = req.body.email
    const otp = crypto.randomInt(100000, 1000000)
    console.log(otp)

    const hash = await argon2.hash(String(otp))

    otp_store.set(email, hash)

    // email otp to provided email address

    res.status(200).send('A password reset link has been sent')
}

const reset_password = async (req, res) => {
    const email = req.body.email
    const otp = req.body.otp

    try {
        const valid = await argon2.verify(otp_store.get(email), otp)
        console.log(otp)
        if (!valid) throw new Error()
    } catch (err) {
        return res.status(401).send('Something went wrong')
    }

    return res.status(200).send('One-time password verified')
}

module.exports = {
    signup,
    login,
    forgot_password,
    reset_password
}
