import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Miguel | Data Scientist',
  description: 'Data science professional with a multi-lingual and international background, passionate about machine learning, big data technologies and data engineering solutions, currently applying deep learning algorithms in the telecom sector at Nokia, while continuously pursuing personal growth through amateur boxing and chess.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
