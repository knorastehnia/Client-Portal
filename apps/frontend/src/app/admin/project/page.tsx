'use client'

import { redirect } from 'next/dist/server/api-utils'
import styles from './page.module.css'
import { useEffect, useState } from 'react'

const ProjectPage = () => {
    const [projectID, setProjectID] = useState<string | null>('')

    const getProject = async (paramProjectID: string) => {
        try {
            const respone = await fetch(`http://org1.localhost:3000/api/admin/project/get-project?project_id=${paramProjectID}`, {
                method: 'GET',
                credentials: 'include'
            })

            const result = await respone.json()

            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                console.log(result)
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
        <div>Project {projectID}</div>
    )
}

export default ProjectPage
