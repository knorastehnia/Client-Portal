import styles from './button.module.css'

interface ButtonProps {
    children: React.ReactNode
    buttonStyle: 'main' | 'alt',
    buttonDisabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ children, buttonStyle, buttonDisabled=false }) => {
    return (
        <button
            className={[
                styles.button,
                buttonStyle === 'main'
                    ? styles['button-main']
                    : styles['button-alt']
            ].join(' ')}
            type='submit'
            disabled={buttonDisabled}
        >
            {children}
        </button>
    )
}

export default Button
