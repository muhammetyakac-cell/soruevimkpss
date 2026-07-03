import { sql } from '@/lib/db'
import Link from 'next/link'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function Home() {
  // Fetch categories from Neon DB
  const categories = await sql`SELECT id, category_id, title, icon, description FROM categories ORDER BY id ASC`;
  
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat: any) => {
      const countRes = await sql`SELECT COUNT(*) FROM questions WHERE category_id = ${cat.category_id}`;
      return {
        ...cat,
        totalQuestions: parseInt(countRes[0].count)
      };
    })
  );

  return (
    <section id="home" className="page-section active">
      <div className="hero">
          <h1 className="gradient-text">KPSS'ye Hazırlanmanın<br/>En Etkili Yolu</h1>
          <p>Modern arayüz, anında geri bildirim ve detaylı istatistiklerle hedefine ulaş.</p>
      </div>

      <div className="categories-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ margin: 0 }}>Konu Alanları</h2>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: '999px' }}>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Çözülen:</span>
                      <span className="text-primary" id="global-total-solved" style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>0</span>
                  </div>
                  <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: '999px' }}>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Başarı:</span>
                      <span className="text-primary" id="global-success-rate" style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>%0</span>
                  </div>
              </div>
          </div>

          <div className="categories-grid">
              {categoriesWithCounts.map((cat) => (
                <Link 
                  href={`/kategori/${cat.category_id}`} 
                  key={cat.id} 
                  className="category-card glass-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="category-icon">{cat.icon}</div>
                  <div className="category-info">
                      <h3>{cat.title}</h3>
                      <p>{cat.totalQuestions || 0} Soru</p>
                  </div>
                </Link>
              ))}
          </div>
      </div>

      {/* FAQ SECTION */}
      <div className="faq-container" style={{ marginTop: '4rem', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Sıkça Sorulan Sorular (SSS)</h2>
          <div className="glass-card faq-card">
              <h4 style={{ marginBottom: '0.5rem' }}>KPSS testlerini ücretsiz mi çözüyorum?</h4>
              <p className="text-muted">Evet, SoruEvim platformundaki Tarih, Coğrafya, Vatandaşlık, Matematik ve Türkçe gibi tüm KPSS online deneme ve yaprak testleri tamamen ücretsizdir.</p>
          </div>
          <div className="glass-card faq-card">
              <h4 style={{ marginBottom: '0.5rem' }}>Online KPSS denemeleri güncel mi?</h4>
              <p className="text-muted">Sistemimize düzenli olarak yeni müfredata ve ÖSYM'nin yeni nesil soru tiplerine uygun güncel bilgiler ve testler otomatik olarak eklenmektedir.</p>
          </div>
          <div className="glass-card faq-card">
              <h4 style={{ marginBottom: '0.5rem' }}>Çözdüğüm testlerin sonucunu görebilir miyim?</h4>
              <p className="text-muted">Testi bitirdiğiniz anda kaç doğru, kaç yanlış yaptığınızı görebilir, soruların detaylı çözümlerini ve açıklamalarını anında inceleyebilirsiniz. İlerlemeniz cihazınıza kaydedilir.</p>
          </div>
      </div>
      
      {/* FAQ JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "KPSS testlerini ücretsiz mi çözüyorum?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Evet, SoruEvim platformundaki Tarih, Coğrafya, Vatandaşlık, Matematik ve Türkçe gibi tüm KPSS online deneme ve yaprak testleri tamamen ücretsizdir."
              }
            },
            {
              "@type": "Question",
              "name": "Online KPSS denemeleri güncel mi?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sistemimize düzenli olarak yeni müfredata ve ÖSYM'nin yeni nesil soru tiplerine uygun güncel bilgiler ve testler otomatik olarak eklenmektedir."
              }
            },
            {
              "@type": "Question",
              "name": "Çözdüğüm testlerin sonucunu görebilir miyim?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Testi bitirdiğiniz anda kaç doğru, kaç yanlış yaptığınızı görebilir, soruların detaylı çözümlerini ve açıklamalarını anında inceleyebilirsiniz. İlerlemeniz cihazınıza kaydedilir."
              }
            }
          ]
        })
      }} />
    </section>
  )
}
