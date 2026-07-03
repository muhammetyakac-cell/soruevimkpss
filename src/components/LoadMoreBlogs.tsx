'use client'
import { useState } from 'react'
import { getMoreClusters } from '@/app/actions/blog'
import Link from 'next/link'

export default function LoadMoreBlogs({ initialCount }: { initialCount: number }) {
  const [posts, setPosts] = useState<any[]>([])
  const [offset, setOffset] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    setLoading(true)
    try {
      const newPosts = await getMoreClusters(offset, 20)
      if (newPosts.length < 20) {
        setHasMore(false)
      }
      setPosts([...posts, ...newPosts])
      setOffset(offset + 20)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {posts.map((article: any) => (
        <Link 
          href={`/blog/${article.slug}`} 
          key={article.slug} 
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="glass-card test-card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Alt Yazı
                </span>
              </div>
              <h3 style={{ marginBottom: '0.8rem', color: 'var(--text-color)' }}>{article.title}</h3>
              <p className="text-muted" style={{ 
                fontSize: '0.9rem', 
                flexGrow: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{article.description}</p>
          </div>
        </Link>
      ))}
      
      {hasMore && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={loadMore} 
            disabled={loading}
            className="btn-outline" 
            style={{ padding: '0.8rem 2rem' }}
          >
            {loading ? 'Yükleniyor...' : 'Daha Fazla Yazı Yükle'}
          </button>
        </div>
      )}
    </>
  )
}
