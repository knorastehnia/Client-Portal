import { useState, useEffect, useRef } from "react"
import styles from './projects.module.css'
import Image from "next/image"

interface ProjectHeader {
    id: string,
    title: string,
    updated_at: string,
    current_status: string,
    sort_index: string | null
}

const Projects = () => {
    const sliderRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const dragTargetRef = useRef<HTMLElement>(null)
    const dragPlaceholderRef = useRef<HTMLElement>(null)
    const dropAfterRef = useRef<HTMLElement>(null)
    const dropBeforeRef = useRef<HTMLElement>(null)

    const projectsOrderRef = useRef<string>(null)

    const clientXRef = useRef<number>(0)

    const [projectHeaders, setProjectHeaders] = useState<ProjectHeader[]>([])
    const [showButtons, setShowButtons] = useState<boolean[]>([false, false])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const getProjects = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/project/get-project-headers', {
                method: 'GET',
                credentials: 'include'
            })

            if (!response.ok) throw new Error(`Failed to fetch - status: ${response.status}`)

            const result = await response.json()

            if (result instanceof Array) {
                result.sort((a: ProjectHeader, b: ProjectHeader) => {
                    if (a.sort_index !== null && b.sort_index !== null) {
                        return Number(a.sort_index) - Number(b.sort_index)
                    } else {
                        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                    }
                })
            }

            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setProjectHeaders(result)
                setIsLoading(false)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const scrollSlider = (scrollAmount: number) => {
        sliderRef.current?.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        })
    }

    const handleScrollButtons = () => {
        const slider = sliderRef.current
        const maxScroll = slider!.scrollWidth - slider!.getBoundingClientRect().width
        setShowButtons([
            (slider?.scrollLeft || 0) > 5,
            (slider?.scrollLeft || 0) < maxScroll - 5
        ])
    }

    const updateProjectOrder = async () => {
        const content = contentRef.current
        if (content === null) return

        const projects = Array.from(
            content.children as HTMLCollectionOf<HTMLAnchorElement>)

        const sorted = projects.map((element: HTMLAnchorElement, index) =>
            new URLSearchParams(new URL(element.href).search).get('project_id')!)

        const newProjectsOrder = sorted.reduceRight((prev, curr) => curr += prev)
        if (newProjectsOrder === projectsOrderRef.current) return

        const payload: { [key: string]: any } = {}
        sorted.forEach((projectID, sortIndex) => {
            payload[projectID] = sortIndex
        })

        try {
            const response = await fetch('http://localhost:3000/api/admin/project/sort-active-projects', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sorted: payload })
            })

            if (!response.ok) throw new Error(`Failed to fetch - status: ${response.status}`)
        } catch (err) {
            console.log(err)
        }
    }

    const startDrag = (event: React.PointerEvent) => {
        const content = contentRef.current
        if (content === null) return

        const projects = Array.from(
            content.children as HTMLCollectionOf<HTMLAnchorElement>)

        const sorted = projects.map((element: HTMLAnchorElement, index) =>
            new URLSearchParams(new URL(element.href).search).get('project_id')!)

        projectsOrderRef.current = sorted.reduceRight((prev, curr) => curr += prev)


        dragTargetRef.current = (event.target as HTMLElement).parentElement

        const placeholder = document.createElement('a')
        placeholder.style.border = '1px dashed var(--gray-2)'
        dragPlaceholderRef.current = placeholder
        dragPlaceholderRef.current.style.display = 'none'
        dragTargetRef.current?.before(placeholder)

        const element = dragTargetRef.current
        if (element === null) return

        const { clientX, clientY } = event
        const rect = element.parentElement!.parentElement!.getBoundingClientRect()
        dragPlaceholderRef.current!.style.display = 'block'
        element.style.position = 'absolute'
        element.style.top = `calc(${clientY}px - ${rect.top}px + 2rem)`
        element.style.left = `calc(${clientX}px - ${rect.left}px - 21.5rem)`
        element.style.transition = 'all 0s'
        element.style.zIndex = `13`
        element.parentElement!.style.gap = '2rem'
    }

    const handleDrag = (event: MouseEvent) => {
        clientXRef.current = event.clientX

        const element = dragTargetRef.current
        if (element === null) return

        const { clientX, clientY } = event
        const rect = element.parentElement!.parentElement!.getBoundingClientRect()
        element.style.top = `calc(${clientY}px - ${rect.top}px + 2rem)`
        element.style.left = `calc(${clientX}px - ${rect.left}px - 21.5rem)`
    }

    const endDrag = () => {
        const element = dragTargetRef.current
        if (element === null) return

        const placeholder = dragPlaceholderRef.current
        if (placeholder !== null) {
            placeholder.remove()
            dragPlaceholderRef.current = null
        }

        dragTargetRef.current = null
        element.style = ''
        element.parentElement!.style = ''
        dropAfterRef.current?.after(element)
        dropBeforeRef.current?.before(element)
        getDropZone(new PointerEvent(''))
        updateProjectOrder()
    }

    const cancelDrag = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return

        const element = dragTargetRef.current
        if (element === null) return

        const placeholder = dragPlaceholderRef.current
        if (placeholder !== null) {
            placeholder.remove()
            dragPlaceholderRef.current = null
        }

        dragTargetRef.current = null
        element.style = ''
        element.parentElement!.style = ''
        getDropZone(new PointerEvent(''))
    }

    const getDropZone = (event: PointerEvent) => {
        const content = contentRef.current
        if (content === null) return

        const { clientX, clientY } = event
        const projects = Array.from(content.children)

        for (let project of projects) {
            const contentRect = content.getBoundingClientRect()
            const rect = project.getBoundingClientRect()
            const nextRect = projects.indexOf(project) + 1 === projects.length
                ? contentRect
                : projects[projects.indexOf(project) + 1].getBoundingClientRect()

            if (
                (projects.indexOf(project) === 0 &&
                clientX < contentRect.left + 200)
                &&
                (clientY < rect.bottom + 20 &&
                clientY > rect.top - 20)
            ) {
                if (dragTargetRef.current !== null) {
                    ;(project as HTMLElement).style.marginLeft = '6rem'
                    dropBeforeRef.current = (project as HTMLElement)

                    break
                }
            }

            if (
                (rect.right < clientX && clientX < nextRect.left + 200 ||
                projects.indexOf(project) + 1 === projects.length &&
                clientX > contentRect.right - 200)
                &&
                (clientY < rect.bottom + 20 &&
                clientY > rect.top - 20)
            ) {
                if (dragTargetRef.current !== null) {
                    ;(project as HTMLElement).style.marginRight = '6rem'
                    dropAfterRef.current = (project as HTMLElement)

                    break
                }
            }

            ;(project as HTMLElement).style.margin = ''
            dropAfterRef.current = null
            dropBeforeRef.current = null
        }
    }


    useEffect(() => {
        handleScrollButtons()
    }, [projectHeaders])
    
    useEffect(() => {
        getProjects()

        const interval = setInterval(() => {
            if (!contentRef.current?.parentElement || !dragTargetRef.current) return;

            if (
                contentRef.current.parentElement.getBoundingClientRect().right
                <= clientXRef.current
            ) {
                const scrollAmount =
                    clientXRef.current -
                    contentRef.current.parentElement.getBoundingClientRect().right
                scrollSlider(Math.min(150, scrollAmount * 1.5))
            } else if (
                contentRef.current.parentElement.getBoundingClientRect().left
                >= clientXRef.current
            ) {
                const scrollAmount =
                    clientXRef.current -
                    contentRef.current.parentElement.getBoundingClientRect().left
                scrollSlider(Math.max(-150, scrollAmount * 1.5))
            }
        }, 100)

        sliderRef.current?.addEventListener('scroll', handleScrollButtons)
        contentRef.current?.addEventListener('pointermove', getDropZone)

        document.addEventListener('pointermove', handleDrag)
        document.addEventListener('pointerup', endDrag)
        document.addEventListener('keydown', cancelDrag)

        return () => {
            clearInterval(interval)

            sliderRef.current?.removeEventListener('scroll', handleScrollButtons)
            contentRef.current?.removeEventListener('pointermove', getDropZone)

            document.removeEventListener('pointermove', handleDrag)
            document.removeEventListener('pointerup', endDrag)
            document.removeEventListener('keydown', cancelDrag)
        }
    }, [])

    return (
        <div className={styles['projects-container']}>
            <h2>Active Projects</h2>

            <div ref={sliderRef} className={styles['projects-slider']}>
                <button
                    style={showButtons[0] ? {opacity: 0.5, pointerEvents: 'all'} : {opacity: 0, pointerEvents: 'none'}}
                    onClick={() => scrollSlider(-300)} className={styles['arrow-left']}
                    tabIndex={showButtons[0] ? 0 : -1}
                >
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
                    style={showButtons[1] ? {opacity: 0.5, pointerEvents: 'all'} : {opacity: 0, pointerEvents: 'none'}}
                    onClick={() => scrollSlider(300)} className={styles['arrow-right']}
                    tabIndex={showButtons[1] ? 0 : -1}
                >
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

                <div ref={contentRef} className={styles['projects-content']}>
                    {
                    projectHeaders.length !== 0
                        ? projectHeaders.map((element, index) => (
                            <a
                                href={`/admin/project?project_id=${element.id}`}
                                draggable={false}
                                key={index}
                            >
                                <div
                                    className={styles['drag-handle']}
                                    onPointerDown={startDrag}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <Image
                                        src='/icons/DragHandle.svg'
                                        style={{pointerEvents:'none'}}
                                        alt='drag'
                                        width={24}
                                        height={24}
                                    />
                                </div>

                                <span>
                                    {element.title}
                                </span>
                            </a>))
                        : isLoading
                            ? [...Array(3).keys()].map((value) =>
                                (<div key={value} className={styles['skeleton']}></div>))
                            : <span className={styles['empty']}>No Active Projects</span>
                    }
                </div>
            </div>
        </div>
    )
}

export default Projects
