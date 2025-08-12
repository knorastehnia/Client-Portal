const { db } = require('../../stores/postgres.js')


const create_project = async (req, res) => {
    const title = req.body.title
    const admin_id = req.admin_id

    try {
        if (!title) throw new Error('Invalid title')

        await db.none(`
            INSERT INTO projects (admin_id, title)
            VALUES ($1, $2)
        `, [admin_id, title])

        return res.status(200).send('Project created')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to create project')
    }
}

const get_project_headers = async (req, res) => {
    const admin_id = req.admin_id

    try {
        const query_result = await db.any(`
            SELECT * FROM projects
            WHERE admin_id = $1
        `, [admin_id])

        return res.status(200).json(query_result)
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to retrieve projects')
    }
}

const get_project = async (req, res) => {
    const admin_id = req.admin_id
    const project_id = req.query.project_id

    try {
        const query_result = await db.one(`
            SELECT * FROM projects
            WHERE admin_id = $1 AND id = $2
        `, [admin_id, project_id])

        return res.status(200).json(query_result)
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to retrieve project')
    }
}

const update_project = async (req, res) => {
    const admin_id = req.admin_id
    const project_id = req.query.project_id
    const title = req.body.title

    try {
        const query_result = await db.one(`
            UPDATE projects
            SET title = $3
            WHERE admin_id = $1 AND id = $2
            RETURNING title
        `, [admin_id, project_id, title])

        return res.status(200).send('Project updated')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to update project')
    }
}

const delete_project = async (req, res) => {
    const admin_id = req.admin_id
    const project_id = req.query.project_id

    try {
        await db.none(`
            DELETE FROM projects
            WHERE admin_id = $1 AND id = $2
        `, [admin_id, project_id])

        return res.status(200).send('Project deleted')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to delete project')
    }
}

const assign_client = async (req, res) => {
    const client_id = req.body.client_id
    const project_id = req.query.project_id

    try {
        await db.none(`
            UPDATE projects SET client_id = $1
            WHERE id = $2
        `, [client_id, project_id])

        return res.status(200).send('Client assigned')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to assign client')
    }
}

module.exports = {
    create_project,
    get_project_headers,
    get_project,
    update_project,
    delete_project,
    assign_client
}
