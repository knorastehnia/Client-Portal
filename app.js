const express = require('express')
const argon2 = require('argon2')
const pgp = require('pg-promise')({})

const cn = {
    host: 'localhost',
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 30
}

const db = pgp(cn)
const app = express()

app.use(express.json())

app.post('/signup', async (req, res) => {
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
})

app.post('/login', async (req, res) => {
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
})

app.get('/', (req, res) => {
    return res.status(200).send('test')
})

module.exports = app
