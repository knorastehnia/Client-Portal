'use client'

import Files from '@/components/dashboard/files'
import styles from './page.module.css'
import { useEffect, useState } from 'react'

interface ProjectHeader {
    id: string,
    client_id: string,
    title: string,
    current_status: string,
    updated_at: string,
    created_at: string
}

const ProjectPage = () => {
    const [projectHeader, setProjectHeader] = useState<ProjectHeader | null>(null)

    const getProject = async (paramProjectID: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/admin/project/get-project?project_id=${paramProjectID}`, {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()

            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setProjectHeader(result)
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const paramProjectID = params.get('project_id')
        if (paramProjectID) {
            getProject(paramProjectID)
        } else {
            window.location.href = '/admin/projects'
        }
    }, [])

    return (
        <div>
            <h2>{projectHeader?.title}</h2>
            <Files />
        </div>
    )
}

export default ProjectPage
