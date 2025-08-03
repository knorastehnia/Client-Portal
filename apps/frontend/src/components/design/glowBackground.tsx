import styles from './glowBackground.module.css'

const GlowBackground = () => {
    return (
        <div className={styles['glow-bg']}>
            <div className={styles['glow-primary']}></div>
            <div className={styles['glow-primary']}></div>
            <div className={styles['glow-primary']}></div>
            <div className={styles['glow-alt']}></div>
            <div className={styles['glow-alt']}></div>
        </div>
    )
}

export default GlowBackground
