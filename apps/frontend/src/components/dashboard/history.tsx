import { useEffect, useState } from "react"
import styles from './history.module.css'

interface ProjectHistoryHeader {
    id: string,
    title: string
}

const Projects = () => {
    const [projectHeaders, setProjectHeaders] = useState<ProjectHistoryHeader[]>([])

    const getProjects = async () => {
        try {
            const response = await fetch('http://org1.localhost:3000/api/admin/project/get-project-headers', {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()
            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setProjectHeaders(result)
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getProjects()
    }, [])

    return (
        <div className={styles['project-list']}>
            <h2>Project History</h2>
            {projectHeaders.map((element, index) => (
                <button key={index}>{element.title}</button>
            ))}
        </div>
    )
}

export default Projects
