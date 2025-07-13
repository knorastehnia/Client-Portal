const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const app = require('../app.js')
const { rc } = require('../stores/redis.js')
const { db, pgp } = require('../stores/postgres.js')
const request = require('supertest')

const send_otp = async () => {
    await request(app)
        .post('/api/admin/auth/forgot-password')
        .send({
            "email": "admin@example.com",
            "subdomain": "someorg"
        }).expect(200)
}

beforeAll(async () => {
    const schema = path.join(__dirname, '..', 'schema.sql')
    const sql = fs.readFileSync(schema, 'utf-8')

    await db.none(sql)

    await rc.flushAll()
})

describe('Admin Auth Flow', () => {
    beforeEach(() => {
        jest.spyOn(crypto, 'randomInt').mockReturnValue(123456)
    })

    test('registration succeeds with unique email and subdomain', async () => {
        const req = await request(app)
            .post('/api/admin/auth/register')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
                "subdomain": "someorg"
            }).expect(200)
    })

    test('registration fails with existing email', async () => {
        const req = await request(app)
            .post('/api/admin/auth/register')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
                "subdomain": "someorg2"
            }).expect(401)
    })

    test('registration fails with existing subdomain', async () => {
        const req = await request(app)
            .post('/api/admin/auth/register')
            .send({
                "email": "admin2@example.com",
                "password": "pwd1234",
                "subdomain": "someorg"
            }).expect(401)
    })

    test('login succeeds with valid credentials', async () => {
        const req = await request(app)
            .post('/api/admin/auth/login')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
                "subdomain": "someorg"
            }).expect(200)
    })

    test('login fails with invalid email', async () => {
        const req = await request(app)
            .post('/api/admin/auth/login')
            .send({
                "email": "admin2@example.com",
                "password": "pwd1234",
                "subdomain": "someorg"
            }).expect(401)
    })

    test('login fails with invalid password', async () => {
        const req = await request(app)
            .post('/api/admin/auth/login')
            .send({
                "email": "admin@example.com",
                "password": "pwd12345",
                "subdomain": "someorg"
            }).expect(401)
    })

    test('login fails with invalid subdomain', async () => {
        const req = await request(app)
            .post('/api/admin/auth/login')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
                "subdomain": "someorg2"
            }).expect(401)
    })

    test('otp verification succeeds', async () => {
        await send_otp()

        const req = await request(app)
            .post('/api/admin/auth/verify-otp')
            .send({
                "email": "admin@example.com",
                "otp": "123456",
                "subdomain": "someorg"
            }).expect(200)
    })

    test('otp verification fails with invalid otp', async () => {
        await send_otp()

        const req = await request(app)
            .post('/api/admin/auth/verify-otp')
            .send({
                "email": "admin@example.com",
                "otp": "654321",
                "subdomain": "someorg"
            }).expect(401)
    })

    test('otp verification fails with invalid email', async () => {
        await send_otp()

        const req = await request(app)
            .post('/api/admin/auth/verify-otp')
            .send({
                "email": "admin2@example.com",
                "otp": "123456",
                "subdomain": "someorg"
            }).expect(401)
    })

    test('otp verification fails with invalid subdomain', async () => {
        await send_otp()

        const req = await request(app)
            .post('/api/admin/auth/verify-otp')
            .send({
                "email": "admin2@example.com",
                "otp": "123456",
                "subdomain": "someorg"
            }).expect(401)
    })
})

afterAll(async () => {
    await rc.quit()
    pgp.end()
})
