const { db } = require('../../stores/postgres.js')
const { mc } = require('../../stores/minio.js')

const upload_file = async (req, res) => {
    const file = req.file;
    const admin_id = req.admin_id
    const project_id = req.query.project_id

    try {
        const query_result = await db.one(`
            INSERT INTO files (admin_id, project_id, file_name)
            VALUES ($1, $2, $3) RETURNING id
        `, [admin_id, project_id, file.originalname])

        await mc.putObject('main-bucket', `${admin_id}/${project_id}/${query_result.id}`, file.buffer)
        return res.status(200).send('File uploaded successfully')
    } catch (err) {
        console.log(err)
        return res.status(401).send('Failed to upload file')
    }
}

const get_file_headers = async (req, res) => {
    const admin_id = req.admin_id
    const project_id = req.query.project_id

    try {
        const query_result = await db.any(`
            SELECT * FROM files
            WHERE admin_id = $1 AND project_id = $2
        `, [admin_id, project_id])

        res.status(200).send(query_result)
    } catch (err) {
        console.log(err)
        res.status(401).send('Failed to get file headers')
    }
}

const get_file = async (req, res) => {
    const admin_id = req.admin_id;
    const project_id = req.query.project_id;
    const file_id = req.query.file_id;

    try {
        const query_result = await db.one(`
            SELECT id FROM files
            WHERE id = $1 AND admin_id = $2 AND project_id = $3
        `, [file_id, admin_id, project_id])

        const stream = await mc.getObject('main-bucket', `${admin_id}/${project_id}/${query_result.id}`)
        return res.status(200).send('File received')
    } catch (err) {
        console.log(err)
        res.status(404).send('File not found')
    }
}

const delete_file = async (req, res) => {
    const admin_id = req.admin_id;
    const project_id = req.query.project_id;
    const file_id = req.query.file_id;

    try {
        const query_result = await db.one(`
            DELETE FROM files
            WHERE id = $1 AND admin_id = $2 AND project_id = $3
            RETURNING id
        `, [file_id, admin_id, project_id])

        await mc.removeObject('main-bucket', `${admin_id}/${project_id}/${query_result.id}`)
        return res.status(200).send('File deleted')
    } catch (err) {
        console.log(err)
        res.status(404).send('File not found')
    }
}

module.exports = {
    upload_file,
    get_file_headers,
    get_file,
    delete_file
}
