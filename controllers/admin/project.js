const { queryResult } = require('pg-promise')
const { db } = require('../../stores/postgres.js')


const create_project = async (req, res) => {
    const title = req.body.title
    const admin_id = req.user_id

    try {
        await db.none(`
            INSERT INTO projects (admin_id, title)
            VALUES ($1, $2)
        `, [admin_id, title])
    } catch (err) {
        console.log(err)
        return res.status(401).send('Something went wrong')
    }

    return res.status(200).send('Project created successfully')
}

const get_project_headers = async (req, res) => {
    const admin_id = req.user_id

    try {
        const query_result = await db.any(`
            SELECT id, title FROM projects
            WHERE admin_id = $1
        `, [admin_id])

        console.log(query_result)
        return res.status(200).send('Projects:')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to retrieve projects')
    }
}

module.exports = {
    create_project
}
