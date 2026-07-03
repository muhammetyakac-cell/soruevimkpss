import { neon } from '@neondatabase/serverless'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sql = neon(process.env.DATABASE_URL!);
  const articles = await sql`SELECT title, description, content, type, category_slug, pillar_slug FROM blogs WHERE slug = ${slug}`;
  const article = articles[0];

  if (!article) {
    notFound();
  }

  // Pillar/Cluster hiyerarşi bağlantıları
  let clusters: any[] = [];
  let pillar: any = null;

  if (article.type === 'pillar') {
    clusters = await sql`SELECT slug, title, description FROM blogs WHERE pillar_slug = ${slug}`;
  } else if (article.pillar_slug) {
    const pRes = await sql`SELECT slug, title FROM blogs WHERE slug = ${article.pillar_slug}`;
    if (pRes.length > 0) pillar = pRes[0];
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.description,
    'author': {
      '@type': 'Organization',
      'name': 'SoruEvim KPSS',
      'url': 'https://soruevimkpss.vercel.app'
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
        'item': 'https://soruevimkpss.vercel.app/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': 'https://soruevimkpss.vercel.app/blog'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': article.title,
        'item': `https://soruevimkpss.vercel.app/blog/${slug}`
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
            {pillar && (
              <>
                <Link href={`/blog/${pillar.slug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}> {pillar.title}</Link> &gt; 
              </>
            )}
            <span className="text-primary"> {article.title}</span>
        </div>

        {article.type === 'pillar' && (
          <div style={{ marginBottom: '1.5rem', background: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', display: 'inline-block', fontSize: '0.85rem', fontWeight: 'bold' }}>
            ★ ANA REHBER
          </div>
        )}

        <article className="glass-card" style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '1.05rem', position: 'relative' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>{article.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontStyle: 'italic', fontSize: '1.1rem' }}>{article.description}</p>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
            
            {pillar && (
              <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Bu yazı, <strong>{pillar.title}</strong> rehberinin bir parçasıdır. Ana rehbere dönmek için:
                </p>
                <Link href={`/blog/${pillar.slug}`} className="btn-outline" style={{ display: 'inline-block', marginTop: '0.5rem', textDecoration: 'none' }}>
                  ← Ana Rehbere Dön
                </Link>
              </div>
            )}
        </article>

        {article.type === 'pillar' && clusters.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Bu Rehberdeki Diğer Yazılar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {clusters.map((c: any, index: number) => (
                <Link key={c.slug} href={`/blog/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '1.2rem', cursor: 'pointer' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', flexShrink: 0, fontWeight: 'bold' }}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--primary)' }}>{c.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
