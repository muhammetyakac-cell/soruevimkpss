import { blogArticles } from '@/lib/blog'
import Link from 'next/link'

export const metadata = {
  title: 'KPSS Rehberliği ve Blog - SoruEvim',
  description: 'KPSS sınav taktikleri, çalışma programları, deneme çözme yöntemleri ve güncel duyurular.'
}

export default function BlogListPage() {
  const articles = Object.values(blogArticles);

  return (
    <section className="page-section active" style={{ display: 'block' }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '2rem' }}>KPSS Rehberliği ve Taktikler</h2>
        
        {articles.map((article) => (
          <Link 
            href={`/blog/${article.slug}`} 
            key={article.slug} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="glass-card" style={{ cursor: 'pointer', marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{article.title}</h3>
                <p className="text-muted">{article.desc}</p>
            </div>
          </Link>
        ))}
    </section>
  )
}
