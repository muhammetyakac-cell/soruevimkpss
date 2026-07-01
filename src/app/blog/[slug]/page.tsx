import { blogArticles } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = blogArticles[params.slug];

  if (!article) {
    notFound();
  }

  return (
    <section className="page-section active" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', display: 'block' }}>
        <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Ana Sayfa</Link> &gt; 
            <Link href="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}> Blog</Link> &gt; 
            <span className="text-primary"> {article.title}</span>
        </div>

        <article className="glass-card" style={{ padding: '2rem', lineHeight: 1.8, fontSize: '1.05rem' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{article.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontStyle: 'italic' }}>{article.desc}</p>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Hemen Test Çözmeye Başla
            </Link>
        </div>
    </section>
  )
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = blogArticles[params.slug];
  if (!article) return {};

  return {
    title: `${article.title} | SoruEvim Blog`,
    description: article.desc
  }
}
