import { useState, useEffect } from "react"
import styles from './projects.module.css'

interface ProjectHeader {
    id: string,
    title: string
}

const Projects = () => {
    const [projectHeaders, setProjectHeaders] = useState<ProjectHeader[]>([])

    const getProjects = async () => {
        try {
            const response = await fetch('http://org1.localhost:3000/api/admin/project/get-project-headers', {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()
            // console.log(result)
            if (result.redirect) {
                console.log('redirecting...')
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
        <div className={styles['projects']}>
            <h2>Active Projects</h2>
            <div className={styles['projects-slider']}>
                {projectHeaders.map((element, index) => (
                    <div key={index}>{element.id}: {element.title}</div>
                ))}
            </div>
        </div>
    )
}

export default Projects
