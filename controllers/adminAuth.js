const argon2 = require('argon2')
const db = require('../stores/postgres.js')

const signup = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    try {
        await db.none(`
            SELECT email FROM orgs
            WHERE email=$1;
        `, email)
    } catch (err) {
        return res.status(401).send('Account already exists')
    }

    const hash = await argon2.hash(password)

    await db.any(`
        INSERT INTO orgs (email, pw_hash) VALUES
        ($1, $2);
    `, [email, hash])

    return res.status(200).send('Account created successfully')
}

const login = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    try {
        const query_result = await db.one(`
            SELECT email, pw_hash FROM orgs
            WHERE email=$1
        `, email)

        const valid = await argon2.verify(query_result.pw_hash, password)
        if (!valid) throw new Error()
    } catch (err) {
        return res.status(401).send('Incorrect credentials')
    }

    return res.status(200).send('Logging in...')
}

module.exports = {
    signup,
    login
}
