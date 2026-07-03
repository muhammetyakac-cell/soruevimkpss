import { neon } from '@neondatabase/serverless'
import Link from 'next/link'

export const metadata = {
  title: 'KPSS Rehberliği ve Blog - SoruEvim',
  description: 'KPSS sınav taktikleri, çalışma programları, deneme çözme yöntemleri ve güncel duyurular.'
}


export default async function BlogListPage() {
  const sql = neon(process.env.DATABASE_URL!);
  // Blogları DB'den çekelim
  const articles = await sql`SELECT slug, title, description, created_at FROM blogs ORDER BY created_at DESC`;

  return (
    <section className="page-section active" style={{ display: 'block' }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '2rem' }}>KPSS Rehberliği ve Taktikler</h2>
        
        {articles.length === 0 && (
          <p className="text-muted">Henüz blog yazısı bulunmamaktadır.</p>
        )}

        {articles.map((article) => (
          <Link 
            href={`/blog/${article.slug}`} 
            key={article.slug} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="glass-card" style={{ cursor: 'pointer', marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{article.title}</h3>
                <p className="text-muted">{article.description}</p>
            </div>
          </Link>
        ))}
    </section>
  )
}
