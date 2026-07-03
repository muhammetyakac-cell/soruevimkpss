import { neon } from '@neondatabase/serverless'
import Link from 'next/link'
import LoadMoreBlogs from '@/components/LoadMoreBlogs'

export const metadata = {
  title: 'KPSS Rehberliği ve Blog - SoruEvim',
  description: 'KPSS sınav taktikleri, çalışma programları, deneme çözme yöntemleri ve güncel duyurular.',
  alternates: {
    canonical: '/blog'
  }
}

export default async function BlogListPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const sql = neon(process.env.DATABASE_URL!);
  
  let articles = [];
  if (kategori) {
    articles = await sql`SELECT slug, title, description, category_slug, created_at FROM blogs WHERE category_slug = ${kategori} ORDER BY created_at DESC LIMIT 20`;
  } else {
    articles = await sql`SELECT slug, title, description, category_slug, created_at FROM blogs ORDER BY created_at DESC LIMIT 20`;
  }

  const categories = await sql`SELECT DISTINCT category_slug FROM blogs WHERE category_slug IS NOT NULL`;

  return (
    <section className="page-section active" style={{ display: 'block', minHeight: '60vh' }}>
        <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Ana Sayfa</Link> &gt; 
            <span className="text-primary"> Blog</span>
        </div>

        <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>SoruEvim Blog</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>KPSS hazırlık sürecinde ihtiyacınız olan tüm rehberlik yazıları ve motivasyon içerikleri.</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link href="/blog" className="btn-outline" style={{ background: !kategori ? 'var(--primary)' : 'transparent', borderColor: 'var(--primary)' }}>Tümü</Link>
          {categories.map((cat: any) => (
            <Link 
              key={cat.category_slug} 
              href={`/blog?kategori=${cat.category_slug}`} 
              className="btn-outline"
              style={{ background: kategori === cat.category_slug ? 'var(--primary)' : 'transparent', borderColor: 'var(--primary)' }}
            >
              {cat.category_slug.toUpperCase()}
            </Link>
          ))}
        </div>
        
        {articles.length === 0 && (
          <p className="text-muted">Bu filtrede henüz yazı bulunmamaktadır.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {articles.map((article: any) => (
            <Link 
              href={`/blog/${article.slug}`} 
              key={article.slug} 
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
            >
              <div className="glass-card test-card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {article.category_slug || 'BLOG'}
                    </span>
                  </div>
                  <h3 style={{ marginBottom: '0.8rem', color: 'var(--text-color)' }}>{article.title}</h3>
                  <p className="text-muted" style={{ 
                    fontSize: '0.9rem', 
                    lineHeight: '1.5',
                    marginBottom: '0.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{article.description}</p>
              </div>
            </Link>
          ))}
          <LoadMoreBlogs initialCount={20} kategori={kategori} />
        </div>
    </section>
  )
}
