import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SoruEvim KPSS - İnteraktif Hazırlık',
  description: 'KPSS adayları için interaktif, modern ve ücretsiz test çözme platformu.',
  openGraph: {
    title: 'SoruEvim KPSS',
    description: 'KPSS adayları için interaktif test çözme platformu.',
    url: 'https://soruevimkpss.vercel.app/',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>
        <header>
            <div className="container">
                <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
                    <span>📚</span> SoruEvim <span className="text-primary">KPSS</span>
                </Link>
                <nav>
                    <Link href="/blog" className="btn-outline">Blog</Link>
                    <Link href="/" className="btn-outline">Ana Sayfa</Link>
                </nav>
            </div>
        </header>

        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}
