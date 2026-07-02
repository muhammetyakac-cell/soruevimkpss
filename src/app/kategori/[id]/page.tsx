import { sql } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: categoryId } = await params;

  // Kategori bilgilerini çek
  const cats = await sql`SELECT * FROM categories WHERE category_id = ${categoryId} LIMIT 1`;
  if (!cats || cats.length === 0) {
    notFound();
  }
  const category = cats[0];

  // Soruları çek
  const questions = await sql`SELECT id, question FROM questions WHERE category_id = ${categoryId} ORDER BY id ASC`;
  const totalQuestions = questions.length;
  const totalTests = Math.ceil(totalQuestions / 10);

  // SEO metinleri
  const seoTexts: Record<string, string> = {
    'tarih': "KPSS Tarih testleri ile Osmanlı'dan İnkılap Tarihine tüm konuları kapsayan online denemeler.",
    'cografya': "KPSS Coğrafya yaprak testleri ile Türkiye'nin yeryüzü şekilleri ve iklimini keşfedin.",
    'vatandaslik': "KPSS Vatandaşlık güncel anayasa değişiklikleri ve temel hukuk bilgisi testleri.",
    'matematik': "KPSS Matematik problemleri ve cebir konularını içeren yeni nesil denemeler.",
    'turkce': "KPSS Türkçe paragraf ve dil bilgisi ağırlıklı online test çözümü."
  };
  const seoText = seoTexts[categoryId] || `${category.title} alanındaki en güncel KPSS online deneme sınavları.`;

  const tests = [];
  for (let i = 0; i < totalTests; i++) {
    const startIndex = i * 10;
    const testQs = questions.slice(startIndex, startIndex + 10);
    const previewText = testQs.length > 0 ? testQs[0].question.substring(0, 80) + '...' : '';
    tests.push({ index: i, count: testQs.length, previewText });
  }

  return (
    <section className="page-section active" style={{ display: 'block' }}>
      <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Ana Sayfa</Link> &gt; 
        <span className="text-primary"> {category.title}</span>
      </div>

      <div className="category-header glass-card" style={{ marginBottom: '2rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>{category.title}</h2>
          <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {seoText}
          </div>
      </div>
      
      <h3 style={{ marginBottom: '1rem' }}>Deneme Sınavları</h3>
      
      {tests.length === 0 ? (
        <p className="text-muted">Bu kategoriye ait henüz test bulunmuyor.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {tests.map((t) => (
            <Link 
              key={t.index} 
              href={`/test/${categoryId}/${t.index}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', padding: '1.2rem', height: '100%' }}>
                  <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0 }}>Test {t.index + 1}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.count} Soru</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                        "{t.previewText}"
                      </p>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', padding: '0.6rem' }}>
                      ▶ Başla
                  </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `${id.toUpperCase()} KPSS Testleri - SoruEvim`,
    description: `${id} alanındaki en güncel KPSS online deneme sınavları.`
  }
}
