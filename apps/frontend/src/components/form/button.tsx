import styles from './button.module.css'

interface ButtonProps {
    children: React.ReactNode
    buttonStyle: 'main' | 'alt'
}

const Button: React.FC<ButtonProps> = ({ children, buttonStyle }) => {
    return (
        <button
            className={[
                styles.button,
                buttonStyle === 'main'
                    ? styles['button-main']
                    : styles['button-alt']
            ].join(' ')}
            type='submit'
        >
            {children}
        </button>
    )
}

export default Button
