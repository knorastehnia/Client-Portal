const crypto = require('crypto')
const argon2 = require('argon2')
const db = require('../stores/postgres.js')
const rc = require('../stores/redis.js')


const register = async (req, res) => {
    const email = req.body.email.toString().toLowerCase()
    const password = req.body.password

    // replace with actual logic
    const role = 'client'
    const org_id = 1

    try {
        if (!['admin', 'client'].includes(role)) throw new Error('Invalid role')

        const exists = await db.none(`
            SELECT org_id, email FROM accounts
            WHERE org_id=$1 AND email=$2;
        `, [org_id, email])

        const hash = await argon2.hash(password)

        const new_row = await db.any(`
            INSERT INTO accounts (org_id, email, pw_hash, account_role) VALUES
            ($1, $2, $3, $4) RETURNING id;
        `, [org_id, email, hash, role])

        const account_id = new_row[0].id
        console.log(account_id)

        const table = role + 's'    // infer table name from role name

        await db.any(`
            INSERT INTO ${table} (id) VALUES ($1)
        `, [account_id])
    } catch (err) {
        console.log(err)
        return res.status(401).send('Something went wrong')
    }

    return res.status(200).send('Account created successfully')
}

const login = async (req, res) => {
    const email = req.body.email.toString().toLowerCase()
    const password = req.body.password
    let user_id = -1

    // replace with actual logic
    const role = 'client'
    const org_id = 1

    try {
        const query_result = await db.one(`
            SELECT id, email, pw_hash FROM accounts
            WHERE org_id=$1 AND email=$2 AND account_role=$3;
        `, [org_id, email, role])

        user_id = query_result.id

        const valid = await argon2.verify(query_result.pw_hash, password)
        if (!valid) throw new Error()
    } catch (err) {
        return res.status(401).send('Incorrect credentials')
    }

    const session_id = crypto.randomBytes(32).toString('hex')

    await rc.set(`session:${session_id}`, user_id, { EX: 7 * 24 * 60 * 60 })

    res.cookie('session-id', session_id, { httpOnly: true, sameSite: 'strict' })
    return res.status(200).send('Logging in...')
}

const forgot_password = async (req, res) => {
    const email = req.body.email.toString().toLowerCase()
    const otp = crypto.randomInt(100000, 1000000)
    console.log(otp)

    // replace with actual logic
    const org_id = 1

    const hash = await argon2.hash(String(otp))

    await rc.set(`otp:${org_id}:${email}`, hash, { EX: 300 })

    // email otp to provided email address

    res.status(200).send('A password reset link has been sent')
}

const verify_otp = async (req, res) => {
    const email = req.body.email.toString().toLowerCase()
    const otp = req.body.otp

    // replace with actual logic
    const org_id = 1

    const stored_hash = await rc.get(`otp:${org_id}:${email}`)

    try {
        const valid = await argon2.verify(stored_hash, otp)
        if (!valid) throw new Error()
    } catch (err) {
        return res.status(401).send('Incorrect credentials')
    }

    const session_id = crypto.randomBytes(32).toString('hex')

    await rc.del(`otp:${org_id}:${email}`)
    await rc.set(`temp-session:${session_id}`, email, { EX: 600 })
    res.cookie('session-id', session_id, { httpOnly: true, sameSite: 'strict' })

    return res.status(200).send('One-time password verified')
}

const reset_password = async (req, res) => {
    const session_id = req.cookies['session-id']
    const email = req.email
    const new_password = req.body.password

    const hash = await argon2.hash(new_password)

    await db.any(`
        UPDATE accounts SET pw_hash = $1
        WHERE email = $2;
    `, [hash, email])

    await rc.del(`temp-session:${session_id}`)

    return res.status(200).send('Password updated successfully')
}

module.exports = {
    register,
    login,
    forgot_password,
    verify_otp,
    reset_password
}
