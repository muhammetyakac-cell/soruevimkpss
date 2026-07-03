import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <h1 className="gradient-text" style={{ fontSize: '6rem', marginBottom: '1rem', lineHeight: '1' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sayfa Bulunamadı</h2>
      <p className="text-muted" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
        Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
      </p>
      <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
        Ana Sayfaya Dön
      </Link>
    </div>
  )
}
