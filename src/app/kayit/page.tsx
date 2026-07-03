'use client'

import { useActionState } from 'react'
import { register } from '@/app/actions/auth'
import Link from 'next/link'

const initialState = {
  error: null as string | null
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register as any, initialState)

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Kayıt Ol</h2>
        
        {state?.error && (
          <div style={{ backgroundColor: 'var(--error)', color: 'white', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Ad Soyad</label>
            <input 
              type="text" 
              name="name" 
              required 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid hsla(0,0%,100%,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid hsla(0,0%,100%,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Şifre</label>
            <input 
              type="password" 
              name="password" 
              required 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid hsla(0,0%,100%,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isPending} style={{ marginTop: '1rem', padding: '0.8rem' }}>
            {isPending ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Zaten hesabınız var mı? <Link href="/giris" className="text-primary" style={{ textDecoration: 'none' }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  )
}
