import { useEffect, useState } from 'react'
import styles from './files.module.css'

interface FileHeader {
    id: string,
    file_name: string,
    file_type: string,
    size_bytes: number
    created_at: string
}

const Files = () => {
    const [fileHeaders, setFileHeaders] = useState<FileHeader[]>()

    const getFileHeaders = async () => {
        const params = new URLSearchParams(window.location.search)
        const paramProjectID = params.get('project_id')

        try {
            const response = await fetch(`http://localhost:3000/api/admin/project/get-file-headers?project_id=${paramProjectID}`, {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()
            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                console.log(result)
                setFileHeaders(result)
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getFileHeaders()
    }, [])

    return (
        <div>
            {fileHeaders?.map((file, index) => (
                <div key={index}>{file.file_name}</div>
            ))}
        </div>
    )
}

export default Files
