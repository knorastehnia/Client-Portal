import { useState } from 'react'
import styles from './input.module.css'

interface InputProps {
    children: React.ReactNode
    inputType: 'email' | 'password' | 'text'
}

const TextInput: React.FC<InputProps> = ({ children, inputType }) => {
    const [inputFocus, setInputFocus] = useState<Boolean>(false)

    return (
        <div className={styles['input-field']}>
            <label
                className={inputFocus ? styles['focused-label'] : ''}
                htmlFor={inputType}
            >
                {children}
            </label>
            <input
                onFocus={() => setInputFocus(true)}
                onBlur={e => e.target.value || setInputFocus(false)}
                type={inputType}
                id={inputType}
                name={inputType}
            />
        </div>
    )
}

export default TextInput
