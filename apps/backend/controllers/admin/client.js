const { db } = require('../../stores/postgres.js')


const create_client = async (req, res) => {
    const client_email = req.body.client_email.toLocaleLowerCase()
    const client_name = req.body.client_name
    const admin_id = req.admin_id

    try {
        if (!client_email || !client_name) throw new Error('Invalid data')

        await db.none(`
            INSERT INTO clients (admin_id, email, full_name)
            VALUES ($1, $2, $3)
        `, [admin_id, client_email, client_name])

        return res.status(200).send('Client created')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to create client')
    }
}

const get_client_headers = async (req, res) => {
    const admin_id = req.admin_id

    try {
        const query_result = await db.any(`
            SELECT * FROM clients
            WHERE admin_id = $1
        `, [admin_id])

        return res.status(200).json(query_result)
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to retrieve clients')
    }
}

const get_client = async (req, res) => {
    const admin_id = req.admin_id
    const client_id = req.query.client_id

    try {
        const query_result = await db.one(`
            SELECT id, email, created_at FROM clients
            WHERE admin_id = $1 AND id = $2
        `, [admin_id, client_id])

        return res.status(200).send('Client retrieved')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to retrieve client')
    }
}

const update_client = async (req, res) => {
    const admin_id = req.admin_id
    const client_id = req.query.client_id
    const client_email = req.body.client_email

    try {
        const query_result = await db.one(`
            UPDATE clients
            SET email = $3
            WHERE admin_id = $1 AND id = $2
            RETURNING email
        `, [admin_id, client_id, client_email])

        return res.status(200).send('Client updated')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to update client')
    }
}

const delete_client = async (req, res) => {
    const admin_id = req.admin_id
    const client_id = req.query.client_id

    try {
        await db.none(`
            DELETE FROM clients
            WHERE admin_id = $1 AND id = $2
        `, [admin_id, client_id])

        return res.status(200).send('Client deleted')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to delete client')
    }
}

module.exports = {
    create_client,
    get_client_headers,
    get_client,
    update_client,
    delete_client
}
