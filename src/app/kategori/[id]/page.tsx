import { sql } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'

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

  const session = await getSession();
  const solvedTests = new Set<number>();
  
  if (session) {
    const progress = await sql`SELECT test_index FROM user_progress WHERE user_id = ${session.userId} AND category_id = ${categoryId}`;
    progress.forEach((p: any) => solvedTests.add(p.test_index));
  }

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
        'name': category.title,
        'item': `https://soruevimkpss.vercel.app/kategori/${categoryId}`
      }
    ]
  };

  return (
    <section className={`page-section active theme-${categoryId}`} style={{ display: 'block' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
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
          {tests.map((t) => {
            const isSolved = solvedTests.has(t.index);
            return (
              <Link 
                key={t.index} 
                href={`/test/${categoryId}/${t.index}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="glass-card test-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', padding: '1.2rem', height: '100%', position: 'relative' }}>
                    {isSolved && (
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--success)', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 10 }}>
                        ✓
                      </div>
                    )}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0 }}>Test {t.index + 1}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.count} Soru</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                          "{t.previewText}"
                        </p>
                    </div>
                    <button className={isSolved ? "btn-outline" : "btn-primary"} style={{ width: '100%', padding: '0.6rem', color: isSolved ? 'var(--success)' : undefined, borderColor: isSolved ? 'var(--success)' : undefined }}>
                        {isSolved ? '✓ Çözüldü (Tekrar Çöz)' : '▶ Başla'}
                    </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `${id.toUpperCase()} KPSS Testleri - SoruEvim`,
    description: `${id} alanındaki en güncel KPSS online deneme sınavları.`,
    alternates: {
      canonical: `/kategori/${id}`
    }
  }
}
