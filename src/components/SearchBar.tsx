'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/arama?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
      <input 
        type="text" 
        placeholder="Ara..." 
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          background: 'rgba(0,0,0,0.3)',
          color: 'white',
          fontSize: '0.9rem',
          outline: 'none',
          width: '150px'
        }}
      />
    </form>
  )
}
