import { sql } from '@/lib/db'
import Link from 'next/link'

export const revalidate = 0; // Sayfa dinamik olarak render edilecek

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const query = q || '';

  if (!query) {
    return (
      <section className="page-section active" style={{ display: 'block' }}>
        <h2>Arama</h2>
        <p className="text-muted">Lütfen aramak istediğiniz kelimeyi yukarıdaki arama çubuğuna girin.</p>
      </section>
    );
  }

  const searchTerm = `%${query}%`;
  
  // Search in questions
  const qResults = await sql`
    SELECT id, category_id, question FROM questions 
    WHERE question ILIKE ${searchTerm} OR explanation ILIKE ${searchTerm}
    LIMIT 10
  `;

  // Search in blogs
  let bResults: any[] = [];
  try {
    bResults = await sql`
      SELECT slug, title, description FROM blogs
      WHERE title ILIKE ${searchTerm} OR description ILIKE ${searchTerm} OR content ILIKE ${searchTerm}
      LIMIT 10
    `;
  } catch (error) {
    // Blog tablosunda content yoksa yedek sorgu
    bResults = await sql`
      SELECT slug, title, description FROM blogs
      WHERE title ILIKE ${searchTerm} OR description ILIKE ${searchTerm}
      LIMIT 10
    `;
  }

  return (
    <section className="page-section active" style={{ display: 'block', minHeight: '60vh' }}>
      <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Arama Sonuçları: "{query}"</h2>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Test Soruları ({qResults.length})</h3>
      {qResults.length === 0 ? <p className="text-muted">Soru bulunamadı.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {qResults.map((q: any) => (
            <div key={q.id} className="glass-card">
              <span className="text-primary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{q.category_id}</span>
              <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }} dangerouslySetInnerHTML={{ __html: q.question.substring(0, 150) + '...' }} />
              <Link href={`/kategori/${q.category_id}`} className="btn-outline" style={{ display: 'inline-block', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                Kategoriye Git
              </Link>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '3rem', marginBottom: '1rem' }}>Blog Yazıları ({bResults.length})</h3>
      {bResults.length === 0 ? <p className="text-muted">Blog yazısı bulunamadı.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bResults.map((b: any) => (
            <Link key={b.slug} href={`/blog/${b.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card test-card">
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{b.title}</h4>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{b.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
