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
    const status = req.query.status
    const client_id = req.query.client_id

    try {
        const query_result = await db.any(`
            SELECT p.id, c.full_name, p.title, p.sort_index,
                p.current_status, p.updated_at, p.created_at 
            FROM projects p
            LEFT JOIN clients c
            ON p.client_id = c.id
            WHERE p.admin_id = $1

            ${status === 'active'
                ? ` AND (p.current_status = 'In Progress'
                    OR   p.current_status = 'Paused') `
                : "" }

            ${(isFinite(+client_id) && client_id.trim() !== '')
                ? ` AND c.id = $2 `
                : "" }
        `, [admin_id, client_id])

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
            SELECT p.id, c.full_name, p.title,
                p.current_status, p.updated_at, p.created_at
            FROM projects p
            LEFT JOIN clients c
            ON p.client_id = c.id
            WHERE p.admin_id = $1 AND p.id = $2
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

const sort_active_projects = async (req, res) => {
    const admin_id = req.admin_id
    const sorted = req.body.sorted

    try {
        for (let project_id in sorted) {
            const sort_index = sorted[project_id]

            await db.none(`
                UPDATE projects SET sort_index = $3
                WHERE admin_id = $1 AND id = $2 AND
                    (current_status = 'In Progress' OR current_status = 'Paused')
            `, [admin_id, project_id, sort_index])
        }

        res.status(200).send()
    } catch (err) {
        console.log(err)
        res.status(401).send('Failed to save sorted order of active projects')
    }
}

const set_project_status = async (req, res) => {
    const admin_id = req.admin_id
    const project_id = req.query.project_id
    const status = req.body.status

    try {
        await db.none(`
            UPDATE projects SET current_status = $3
            WHERE admin_id = $1 AND id = $2
        `, [admin_id, project_id, status])

        res.status(200).send()
    } catch (err) {
        console.log(err)
        res.status(401).send('Failed to set project status')
    }
}

const assign_client = async (req, res) => {
    const admin_id = req.admin_id
    const client_id = req.body.client_id
    const project_id = req.query.project_id

    try {
        const query_result = await db.any(`
            SELECT client_id FROM projects
            WHERE admin_id = $1 AND id = $2
        `, [admin_id, project_id])

        if (query_result[0].client_id !== null) {
            throw new Error('A client is already assigned to this project')
        }

        await db.none(`
            UPDATE projects SET client_id = $3
            WHERE admin_id = $1 AND id = $2
        `, [admin_id, project_id, client_id])

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
    sort_active_projects,
    set_project_status,
    assign_client
}
