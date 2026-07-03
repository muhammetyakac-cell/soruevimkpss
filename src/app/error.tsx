'use client' // Error components must be Client Components

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--error)' }}>Beklenmeyen Bir Hata Oluştu!</h2>
      <p className="text-muted" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
        Sistemsel bir sorunla karşılaştık. Lütfen sayfayı yenilemeyi deneyin.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => reset()}
          className="btn-primary"
        >
          Tekrar Dene
        </button>
        <Link href="/" className="btn-outline" style={{ textDecoration: 'none' }}>
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
