import { useState, useEffect, useRef } from "react"
import styles from './projects.module.css'
import Image from "next/image"

interface ProjectHeader {
    id: string,
    title: string,
    updated_at: string
}

const Projects = () => {
    const sliderRef = useRef<HTMLDivElement>(null)
    const dragTargetRef = useRef<HTMLElement>(null)
    const dragPlaceholderRef = useRef<HTMLElement>(null)

    const [projectHeaders, setProjectHeaders] = useState<ProjectHeader[]>([])
    const [showButtons, setShowButtons] = useState<boolean[]>([false, false])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const getProjects = async () => {
        try {
            const response = await fetch('http://org1.localhost:3000/api/admin/project/get-project-headers', {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()

            if (result instanceof Array) {
                result.sort(
                    (a: ProjectHeader, b: ProjectHeader) => 
                    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                )
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

    const startDrag = (event: React.PointerEvent) => {
        dragTargetRef.current = (event.target as HTMLElement).parentElement

        const placeholder = document.createElement('a')

        placeholder.style.position = 'relative'
        placeholder.style.height = '12rem'
        placeholder.style.width = '24rem'
        placeholder.style.padding = '1.5rem'
        placeholder.style.border = '1px dashed var(--gray-2)'
        placeholder.style.borderRadius = '35px'

        dragPlaceholderRef.current = placeholder
        dragTargetRef.current?.before(placeholder)
        
        const element = dragTargetRef.current
        if (element === null) return

        const {clientX, clientY} = event

        element.style.position = 'absolute'
        // element.style.transition = 'top 0s'
        element.style.top = `calc(${clientY}px - 2.5rem)`
        element.style.left = `calc(${clientX}px - 21.5rem)`
        element.style.zIndex = `13`

        document.body.style.cursor = 'grabbing'
        document.body.style.pointerEvents = 'none'
    }

    const handleDrag = (event: MouseEvent) => {
        const element = dragTargetRef.current
        if (element === null) return

        const {clientX, clientY} = event

        const rect = element.getBoundingClientRect()

        element.style.top = `calc(${clientY}px - 0 * ${rect.top}px - 2.5rem)`
        element.style.left = `calc(${clientX}px - 21.5rem)`
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
        document.body.style = ''
    }

    useEffect(() => {
        handleScrollButtons()
    }, [projectHeaders])
    
    useEffect(() => {
        getProjects()

        sliderRef.current?.addEventListener('scroll', handleScrollButtons)
        window.addEventListener('pointermove', handleDrag)
        window.addEventListener('pointerup', endDrag)
        return () => {
            sliderRef.current?.removeEventListener('scroll', handleScrollButtons)
            window.removeEventListener('pointermove', handleDrag)
            window.removeEventListener('pointerup', endDrag)
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

                <div className={styles['projects-content']}>
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
