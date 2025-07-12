const pgp = require('pg-promise')({})

const cn = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 30
}

const db = pgp(cn)

module.exports = {
    pgp,
    db
}
