const fs = require('fs')
const path = require('path')
const app = require('../app.js')
const { rc } = require('../stores/redis.js')
const { db, pgp } = require('../stores/postgres.js')
const request = require('supertest')

beforeAll(async () => {
    const schema = path.join(__dirname, '..', 'schema.sql')
    const sql = fs.readFileSync(schema, 'utf-8')

    await db.none(sql)

    await rc.flushAll()
})

describe('Auth', () => {
    test('Admin registers initially', async () => {
        const req = await request(app)
            .post('/api/admin/auth/register')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
                "subdomain": "someorg"
            }).expect(200)
    })

    test('Admin registers with existing email', async () => {
        const req = await request(app)
            .post('/api/admin/auth/register')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
                "subdomain": "someorg"
            }).expect(401)
    })

    test('Admin logs in with valid credentials', async () => {
        const req = await request(app)
        .post('/api/admin/auth/login')
        .send({
            "email": "admin@example.com",
            "password": "pwd1234",
            "subdomain": "someorg"
        }).expect(200)
    })

    test('Admin logs in with invalid email', async () => {
        const req = await request(app)
        .post('/api/admin/auth/login')
        .send({
            "email": "admin2@example.com",
            "password": "pwd1234",
            "subdomain": "someorg"
        }).expect(401)
    })

    test('Admin logs in with invalid password', async () => {
        const req = await request(app)
        .post('/api/admin/auth/login')
        .send({
            "email": "admin@example.com",
            "password": "pwd12345",
            "subdomain": "someorg"
        }).expect(401)
    })

    test('Admin logs in with invalid subdomain', async () => {
        const req = await request(app)
        .post('/api/admin/auth/login')
        .send({
            "email": "admin@example.com",
            "password": "pwd1234",
            "subdomain": "someorg2"
        }).expect(401)
    })
})

afterAll(async () => {
    await rc.quit()
    pgp.end()
})
