import { neon } from '@neondatabase/serverless'
import Link from 'next/link'

export const metadata = {
  title: 'KPSS Rehberliği ve Blog - SoruEvim',
  description: 'KPSS sınav taktikleri, çalışma programları, deneme çözme yöntemleri ve güncel duyurular.'
}

export default async function BlogListPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const sql = neon(process.env.DATABASE_URL!);
  
  let articles = [];
  if (kategori) {
    articles = await sql`SELECT slug, title, description, type, created_at FROM blogs WHERE category_slug = ${kategori} ORDER BY type DESC, created_at DESC LIMIT 50`;
  } else {
    articles = await sql`SELECT slug, title, description, type, created_at FROM blogs WHERE type = 'pillar' ORDER BY created_at DESC LIMIT 50`;
  }

  const categories = await sql`SELECT DISTINCT category_slug FROM blogs WHERE category_slug IS NOT NULL`;

  return (
    <section className="page-section active" style={{ display: 'block', minHeight: '60vh' }}>
        <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Ana Sayfa</Link> &gt; 
            <span className="text-primary"> Blog</span>
        </div>

        <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>KPSS Rehberleri</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>İhtiyacınız olan konu başlığını seçerek tüm detaylı rehberlere (Pillar) ve alt yazılara (Cluster) ulaşabilirsiniz.</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link href="/blog" className="btn-outline" style={{ background: !kategori ? 'var(--primary)' : 'transparent', borderColor: 'var(--primary)' }}>Ana Rehberler</Link>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {articles.map((article: any) => (
            <Link 
              href={`/blog/${article.slug}`} 
              key={article.slug} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="glass-card test-card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', background: article.type === 'pillar' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', color: 'white', textTransform: 'uppercase' }}>
                      {article.type === 'pillar' ? '★ ANA REHBER' : 'Alt Yazı'}
                    </span>
                  </div>
                  <h3 style={{ marginBottom: '0.8rem', color: 'var(--primary-color)' }}>{article.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem', flexGrow: 1 }}>{article.description}</p>
              </div>
            </Link>
          ))}
        </div>
    </section>
  )
}
