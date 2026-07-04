import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
import SearchBar from '@/components/SearchBar'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kpssevim.blog'),
  title: 'SoruEvim KPSS | Türkiye\'nin En Yeni Nesil Çözümlü Test Platformu',
  description: 'KPSS Lisans, Önlisans ve Ortaöğretim için tamamen ücretsiz, güncel müfredata uygun online testler, denemeler ve konu anlatımları. Tarih, Coğrafya, Vatandaşlık, Türkçe ve Matematik testlerini hemen çözmeye başla!',
  openGraph: {
    title: 'SoruEvim KPSS | Ücretsiz Online Deneme ve Yaprak Testler',
    description: 'KPSS maratonunda netlerini artır! Binlerce çözümlü soru, anlık analiz ve başarı grafiğinle rakiplerini geride bırak.',
    url: 'https://www.kpssevim.blog/',
    siteName: 'SoruEvim KPSS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SoruEvim KPSS',
      },
    ],
    type: 'website',
  },
  alternates: {
    canonical: '/',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="tr">
      <body>
        <header>
            <div className="container">
                <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary)"/>
                    <path d="M2 17L12 22L22 17" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>SoruEvim <span className="text-primary">KPSS</span></span>
                </Link>
                <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <SearchBar />
                    <Link href="/blog" className="btn-outline" style={{ padding: '0.5rem 1.5rem' }}>Blog</Link>
                    <Link href="/#home" className="btn-outline" style={{ padding: '0.5rem 1.5rem' }}>Kategoriler</Link>
                    {session ? (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{session.name}</span>
                        <LogoutButton />
                      </div>
                    ) : (
                      <Link href="/giris" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Giriş Yap</Link>
                    )}
                </nav>
            </div>
        </header>

        <main className="container">
          {children}
        </main>

        <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', padding: '3rem 0', background: 'hsla(222, 47%, 4%, 0.5)' }}>
          <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem' }}>
            <div style={{ flex: '1 1 300px' }}>
              <Link href="/" className="logo" style={{ textDecoration: 'none', marginBottom: '1rem', display: 'inline-flex' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary)"/>
                  <path d="M2 17L12 22L22 17" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>SoruEvim <span className="text-primary">KPSS</span></span>
              </Link>
              <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '300px' }}>
                KPSS adayları için modern, interaktif ve tamamen ücretsiz test çözme platformu. Hedefinize ulaşmanıza yardımcı oluyoruz.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ marginBottom: '1rem' }}>Hızlı Bağlantılar</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><Link href="/" className="text-muted" style={{ textDecoration: 'none' }}>Ana Sayfa</Link></li>
                  <li><Link href="/blog" className="text-muted" style={{ textDecoration: 'none' }}>Blog</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ marginBottom: '1rem' }}>Yasal</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><Link href="/gizlilik-politikasi" className="text-muted" style={{ textDecoration: 'none' }}>Gizlilik Politikası</Link></li>
                  <li><Link href="/kullanim-sartlari" className="text-muted" style={{ textDecoration: 'none' }}>Kullanım Şartları</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="container" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} SoruEvim KPSS. Tüm hakları saklıdır.
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
