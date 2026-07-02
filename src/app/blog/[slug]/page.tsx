import { neon } from '@neondatabase/serverless'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60; // Her 60 saniyede bir önbelleği temizle

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const sql = neon(process.env.DATABASE_URL!);
  const articles = await sql`SELECT title, description, content FROM blogs WHERE slug = ${params.slug}`;
  const article = articles[0];

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
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontStyle: 'italic' }}>{article.description}</p>
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

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sql = neon(process.env.DATABASE_URL!);
  const articles = await sql`SELECT title, description FROM blogs WHERE slug = ${params.slug}`;
  const article = articles[0];

  if (!article) return {};

  return {
    title: `${article.title} | SoruEvim Blog`,
    description: article.description
  }
}
