import { useState, useEffect, useRef } from "react"
import styles from './projects.module.css'

interface ProjectHeader {
    id: string,
    title: string
}

const Projects = () => {
    const sliderRef = useRef<HTMLDivElement>(null)
    // const [scroll, setScroll] = useState<number>(0)
    const [projectHeaders, setProjectHeaders] = useState<ProjectHeader[]>([])

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
        <div className={styles['projects-container']}>
            <h2>Active Projects</h2>

            <div ref={sliderRef} className={styles['projects-slider']}>
                <button
                    onClick={() => sliderRef.current ? sliderRef.current.scrollLeft -= 100 : null}
                    className={styles['arrow-left']}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="36px" viewBox="0 -960 960 960" width="36px"
                    >
                        <path 
                            d="M560-267.69 347.69-480 
                            560-692.31 588.31-664l-184 
                            184 184 184L560-267.69Z"
                        />
                    </svg>
                </button>

                <button
                    onClick={() => sliderRef.current ? sliderRef.current.scrollLeft += 100 : null}
                    className={styles['arrow-right']}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="36px" viewBox="0 -960 960 960" width="36px"
                    >
                        <path 
                            d="m531.69-480-184-184L376-692.31 
                            588.31-480 376-267.69 347.69-296l184-184Z"
                        />
                    </svg>
                </button>

                <div className={styles['projects-content']}>
                    {projectHeaders.map((element, index) => (
                        <div key={index}>{element.title}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Projects
