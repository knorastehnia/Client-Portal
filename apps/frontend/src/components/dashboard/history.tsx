import { useEffect, useState } from "react"
import styles from './history.module.css'

interface ProjectHistoryHeader {
    id: string,
    title: string,
    updated_at: string,
    created_at: string,
    full_name: string,
    current_status: string
}

const Projects = () => {
    const [projectHeaders, setProjectHeaders] = useState<ProjectHistoryHeader[]>([])
    const [filteredHeaders, setFilteredHeaders] = useState<ProjectHistoryHeader[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const getProjects = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/project/get-project-headers', {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()

            if (result instanceof Array) {
                result.sort(
                    (a: ProjectHistoryHeader, b: ProjectHistoryHeader) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
            }

            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setProjectHeaders(result)
                setFilteredHeaders(result)
                setIsLoading(false)
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

    const searchProjects = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        let result = []

        for (let item of projectHeaders) {
            if (
                item.title.toLocaleLowerCase()
                    .includes(value.toLocaleLowerCase().trim())
            ) result.push(item)
        }

        setFilteredHeaders(result)
    }

    useEffect(() => {
        getProjects()
    }, [])

    return (
        <div className={styles['projects-history']}>
            <div className={styles['header']}>
                <h2>Project History</h2>
                <div className={styles['search-options']}>
                    <input
                        type="search"
                        placeholder={'Search...'}
                        onChange={searchProjects}
                    />
                </div>
            </div>

            <div className={styles['projects-list']}>
                {filteredHeaders.length !== 0
                    ? filteredHeaders.map((element, index) => (
                        <a
                            href={`/admin/project?project_id=${element.id}`}
                            key={index}
                        >
                            <div>{element.title}</div>
                            <div className={styles['details']}>
                                <div className={styles['detail']}>
                                    <span className={styles['label']}>Client:</span>
                                    <span className={styles['date']}>
                                        {element.full_name !== null
                                            ? element.full_name
                                            : 'Not Assigned'
                                        }
                                    </span>
                                </div>
                                <div className={styles['detail']}>
                                    <span className={styles['label']}>Created:</span>
                                    <span className={styles['date']}>
                                        {new Date(element.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={styles['detail']}>
                                    <span className={styles['label']}>Updated:</span>
                                    <span className={styles['date']}>
                                        {getTimeSince(element.updated_at)}
                                    </span>
                                </div>
                                <div className={styles['detail']}>
                                    <span className={styles['label']}>Status:</span>
                                    <span
                                        className={styles['status']}
                                        style={
                                            element.current_status === 'Cancelled' ?
                                                {backgroundColor: '#262626'} :
                                            element.current_status === 'Paused' ?
                                                {backgroundColor: '#e69a3d'} :
                                            element.current_status === 'In Progress' ?
                                                {backgroundColor: '#667aff'} :
                                            element.current_status === 'Completed' ?
                                                {backgroundColor: '#3da45a'} : {}
                                        }
                                    >
                                        {
                                            element.current_status
                                        }
                                    </span>
                                </div>
                            </div>
                        </a>))
                    : isLoading
                        ? [...Array(6).keys()].map((value) => (
                            <div key={value} className={styles['skeleton']}></div>))
                        : <span className={styles['empty']}>You have no project history</span>
                }
            </div>
        </div>
    )
}

export default Projects
