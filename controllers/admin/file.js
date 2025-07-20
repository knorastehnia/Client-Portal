const { db } = require('../../stores/postgres.js')

const upload_file = async (req, res) => {
    const file = req.file;
    console.log(file)
}

module.exports = {
    upload_file
}
