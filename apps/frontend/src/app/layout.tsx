import type { Metadata } from 'next'
import { Geist, Geist_Mono, Lato } from 'next/font/google'
import './globals.css'

const lato = Lato({
    weight: ['300', '400', '700'],
    subsets: ['latin']
})

export const metadata: Metadata = {
    title: 'Client Portal',
    description: 'Custom multi-tenant client portal app',
}

export default function RootLayout({ children }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en'>
        <body className={lato.className}>
            {children}
        </body>
        </html>
    )
}
