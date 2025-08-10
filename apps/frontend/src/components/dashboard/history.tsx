import { useEffect, useState } from "react"
import styles from './history.module.css'

interface ProjectHistoryHeader {
    id: string,
    title: string,
    updated_at: string,
    created_at: string
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
            result.sort(
                (a: ProjectHistoryHeader, b: ProjectHistoryHeader) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setProjectHeaders(result)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const getTimeSince = (timeString: string) => {
        const diff = new Date().getTime() - new Date(timeString).getTime()
        const timeScale: any = [
            ['second', 1000],
            ['minute', 60],
            ['hour', 60],
            ['day', 24],
            ['week', 7],
            ['month', 4.34],
            ['year', 12],
            ['inf', Infinity]
        ]

        let current = 1

        for (let scale of timeScale) {
            current *= scale[1]

            try {
                const next = current * timeScale[timeScale.indexOf(scale) + 1][1]
                if (diff >= current && diff < next) {
                    const result = Math.floor(diff / current)
                    return `${result} ${scale[0]}${result !== 1 ? 's' : ''} ago`
                }
            } catch {
                return 'Just now'
            }
        }
    }

    useEffect(() => {
        getProjects()
    }, [])

    return (
        <div className={styles['projects-history']}>
            <h2>Project History</h2>
            <div className={styles['projects-list']}>
                {projectHeaders.length !== 0
                    ? projectHeaders.map((element, index) => (
                        <button key={index}>
                            <div>{element.title}</div>
                            <div>
                                <span className={styles['date-label']}>Updated:</span>
                                <span className={styles['date']}>
                                    {getTimeSince(element.updated_at)}
                                </span>
                            </div>
                            <div>
                                <span className={styles['date-label']}>Created:</span>
                                <span className={styles['date']}>
                                    {new Date(element.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </button>))
                    : <span className={styles['empty']}>No Project History</span>
                }
            </div>
        </div>
    )
}

export default Projects
