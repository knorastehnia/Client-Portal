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
        .set('origin', 'http://org1.localhost.localhost')
        .send({
            "email": "admin@example.com",
        }).expect(200)
}

const reset_db = async () => {
    const schema = path.join(__dirname, '..', 'schema.sql')
    const sql = fs.readFileSync(schema, 'utf-8')

    await db.none(sql)
}

beforeAll(async () => {
    jest.spyOn(crypto, 'randomInt').mockReturnValue(123456)
    jest.spyOn(crypto, 'randomBytes').mockReturnValue(Buffer.from('1')) // .toString('hex') --> '31' 

    await reset_db()
    await rc.flushAll()
})

describe('Auth/Invitation Flow', () => {
    test('registration fails with invalid email', async () => {
        const req = await request(app)
            .post('/api/admin/auth/register')
            .set('origin', 'http://org1.localhost')
            .send({
                "email": "",
                "password": "pwd1234",
                "subdomain": "org1"
            }).expect(401)
    })

    test('admin registration succeeds with unique email and subdomain', async () => {
        const req = await request(app)
            .post('/api/admin/auth/register')
            .set('origin', 'http://org1.localhost')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
                "subdomain": "org1"
            }).expect(200)
    })

    test('admin registration fails with existing email', async () => {
        const req = await request(app)
            .post('/api/admin/auth/register')
            .set('origin', 'http://org1.localhost')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
                "subdomain": "org2"
            }).expect(401)
    })

    test('admin registration fails with existing subdomain', async () => {
        const req = await request(app)
            .post('/api/admin/auth/register')
            .set('origin', 'http://org1.localhost')
            .send({
                "email": "admin2@example.com",
                "password": "pwd1234",
                "subdomain": "org1"
            }).expect(401)
    })

    test('admin login fails with invalid email', async () => {
        const req = await request(app)
            .post('/api/admin/auth/login')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "admin2@example.com",
                "password": "pwd1234",
            }).expect(401)
    })

    test('admin login fails with invalid password', async () => {
        const req = await request(app)
            .post('/api/admin/auth/login')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "admin@example.com",
                "password": "pwd12345",
            }).expect(401)
    })

    test('admin login fails with invalid subdomain', async () => {
        const req = await request(app)
            .post('/api/admin/auth/login')
            .set('origin', 'http://org2.localhost.localhost')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
            }).expect(401)
    })

    test('admin login succeeds with valid credentials', async () => {
        const req = await request(app)
            .post('/api/admin/auth/login')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "admin@example.com",
                "password": "pwd1234",
            }).expect(200)
    })

    test('admin otp verification fails with invalid otp', async () => {
        await send_otp()

        const req = await request(app)
            .post('/api/admin/auth/verify-otp')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "admin@example.com",
                "otp": "654321",
            }).expect(401)
    })

    test('admin otp verification fails with invalid email', async () => {
        await send_otp()

        const req = await request(app)
            .post('/api/admin/auth/verify-otp')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "admin2@example.com",
                "otp": "123456",
            }).expect(401)
    })

    test('admin otp verification fails with invalid subdomain', async () => {
        await send_otp()

        const req = await request(app)
            .post('/api/admin/auth/verify-otp')
            .set('origin', 'http://org2.localhost.localhost')
            .send({
                "email": "admin2@example.com",
                "otp": "123456",
            }).expect(401)
    })

    test('admin otp verification succeeds', async () => {
        await send_otp()

        const req = await request(app)
            .post('/api/admin/auth/verify-otp')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "admin@example.com",
                "otp": "123456",
            }).expect(200)
    })

    test('admin password reset fails with empty password', async () => {
        const req = await request(app)
            .post('/api/admin/auth/reset-password')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "password": "",
            }).set('Cookie', 'session-id=31').expect(401)
    })

    test('admin password reset fails with invalid subdomain', async () => {
        const req = await request(app)
            .post('/api/admin/auth/reset-password')
            .set('origin', 'http://org2.localhost.localhost')
            .send({
                "password": "newpassword87654321",
            }).set('Cookie', 'session-id=31').expect(401)
    })

    test('admin password reset fails with invalid session id', async () => {
        const req = await request(app)
            .post('/api/admin/auth/reset-password')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "password": "newpassword87654321",
            }).set('Cookie', 'session-id=32').expect(401)
    })

    test('admin password reset succeeds in the same subdomain', async () => {
        const req = await request(app)
            .post('/api/admin/auth/reset-password')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "password": "newpassword87654321",
            }).set('Cookie', 'session-id=31').expect(200)
    })

    test('client registration fails without invite', async () => {
        const req = await request(app)
            .post('/api/client/auth/register')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "client@example.com",
                "password": "pwd1234",
            }).expect(401)
    })

    test('admin client invite fails with invalid session id', async () => {
        const req = await request(app)
            .post('/api/admin/client/create-client')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "client_email": "client@example.com",
            }).set('Cookie', 'session-id=32').expect(401)
    })

    test('admin client invite succeeds', async () => {
        const req = await request(app)
            .post('/api/admin/client/create-client')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "client_email": "client@example.com",
            }).set('Cookie', 'session-id=31').expect(200)
    })

    test('admin client invite succeeds in separate subdomain', async () => {
        const req = await request(app)
            .post('/api/admin/client/create-client')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "client_email": "client@example.com",
            }).set('Cookie', 'session-id=31').expect(401)
    })

    test('admin client invite fails with existing email', async () => {
        const req = await request(app)
            .post('/api/admin/client/create-client')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "client_email": "client@example.com",
            }).set('Cookie', 'session-id=31').expect(401)
    })

    test('client login fails before registration', async () => {
        const req = await request(app)
            .post('/api/client/auth/login')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "client@example.com",
                "password": "",
            }).expect(401)
    })

    test('client registration fails with invalid password', async () => {
        const req = await request(app)
            .post('/api/client/auth/register')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "client@example.com",
                "password": "",
            }).expect(401)
    })

    test('client registration fails with invalid subdomain', async () => {
        const req = await request(app)
            .post('/api/client/auth/register')
            .set('origin', 'http://org2.localhost.localhost')
            .send({
                "email": "client@example.com",
                "password": "pwd1234",
            }).expect(401)
    })

    test('client registration succeeds with invite', async () => {
        const req = await request(app)
            .post('/api/client/auth/register')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "client@example.com",
                "password": "pwd1234",
            }).expect(200)
    })

    test('client login fails with invalid email', async () => {
        const req = await request(app)
            .post('/api/client/auth/login')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "client2@example.com",
                "password": "pwd1234",
            }).expect(401)
    })

    test('client login fails with invalid password', async () => {
        const req = await request(app)
            .post('/api/client/auth/login')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "client@example.com",
                "password": "pwd12345",
            }).expect(401)
    })

    test('client login fails with invalid subdomain', async () => {
        const req = await request(app)
            .post('/api/client/auth/login')
            .set('origin', 'http://org2.localhost.localhost')
            .send({
                "email": "client@example.com",
                "password": "pwd1234",
            }).expect(401)
    })

    test('client login succeeds with valid credentials', async () => {
        const req = await request(app)
            .post('/api/client/auth/login')
            .set('origin', 'http://org1.localhost.localhost')
            .send({
                "email": "client@example.com",
                "password": "pwd1234",
            }).expect(200)
    })
})

afterAll(async () => {
    await reset_db()
    await rc.flushAll()

    await rc.quit()
    pgp.end()
})
