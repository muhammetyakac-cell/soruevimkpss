import { neon } from '@neondatabase/serverless'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sql = neon(process.env.DATABASE_URL!);
  const articles = await sql`SELECT title, description, content, category_slug FROM blogs WHERE slug = ${slug}`;
  const article = articles[0];

  if (!article) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.description,
    'author': {
      '@type': 'Organization',
      'name': 'SoruEvim KPSS',
      'url': 'https://www.kpssevim.blog'
    }
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Ana Sayfa',
        'item': 'https://www.kpssevim.blog/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': 'https://www.kpssevim.blog/blog'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': article.title,
        'item': `https://www.kpssevim.blog/blog/${slug}`
      }
    ]
  };

  return (
    <section className="page-section active" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', display: 'block' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Ana Sayfa</Link> &gt; 
            <Link href="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}> Blog</Link> &gt; 
            <span className="text-primary"> {article.title}</span>
        </div>

        <article className="glass-card" style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '1.05rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {article.category_slug || 'BLOG'}
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>{article.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontStyle: 'italic', fontSize: '1.1rem' }}>{article.description}</p>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Hemen Test Çözmeye Başla
            </Link>
        </div>
    </section>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sql = neon(process.env.DATABASE_URL!);
  const articles = await sql`SELECT title, description FROM blogs WHERE slug = ${slug}`;
  const article = articles[0];

  if (!article) return {};

  return {
    title: `${article.title} | SoruEvim Blog`,
    description: article.description,
    alternates: {
      canonical: `/blog/${slug}`
    }
  }
}
