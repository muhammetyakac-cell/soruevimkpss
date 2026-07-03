import { sql } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function SoruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qId = parseInt(id);

  if (isNaN(qId)) {
    notFound();
  }

  // Soruyu çek
  const questions = await sql`
    SELECT q.id, q.question, q.options, q.correct_answer, q.explanation, q.category_id, c.title as category_title 
    FROM questions q
    JOIN categories c ON q.category_id = c.category_id
    WHERE q.id = ${qId} 
    LIMIT 1
  `;

  if (!questions || questions.length === 0) {
    notFound();
  }

  const q = questions[0];
  const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
  const labels = ['A', 'B', 'C', 'D', 'E'];

  // Hangi teste ait olduğunu bulmak için kategorideki sırasını bulalım
  const allCatQuestions = await sql`SELECT id FROM questions WHERE category_id = ${q.category_id} ORDER BY id ASC`;
  const indexInCat = allCatQuestions.findIndex((item) => item.id === q.id);
  const testIndex = indexInCat !== -1 ? Math.floor(indexInCat / 10) : 0;

  return (
    <section className="page-section active" style={{ maxWidth: '800px', margin: '0 auto', display: 'block' }}>
      <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Ana Sayfa</Link> &gt; 
        <Link href={`/kategori/${q.category_id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}> {q.category_title}</Link> &gt; 
        <span className="text-primary"> Soru #{q.id}</span>
      </div>

      <div className="glass-card question-card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          {q.category_title} Dersi Çıkmış/Örnek Soru
        </h1>
        
        <div className="question-text" dangerouslySetInnerHTML={{ __html: q.question }} style={{ fontSize: '1.2rem', marginBottom: '2rem' }} />

        <div className="options-container" style={{ pointerEvents: 'none' }}>
          {options.map((opt: string, idx: number) => {
            const textParts = opt.split(') ');
            const letter = textParts.length > 1 ? textParts[0] : labels[idx];
            const text = textParts.length > 1 ? textParts.slice(1).join(') ') : opt;
            
            // Sadece doğru cevabı vurgulayalım
            const isCorrect = idx === q.correct_answer;
            const btnClass = `option-btn ${isCorrect ? 'correct' : ''}`;

            return (
              <div key={idx} className={btnClass} style={{ opacity: isCorrect ? 1 : 0.6 }}>
                <span className="option-letter">{letter})</span> <span>{text}</span>
              </div>
            )
          })}
        </div>

        <div className="explanation-box show" style={{ marginTop: '2rem' }}>
            <strong>Çözüm / Açıklama:</strong>
            <p dangerouslySetInnerHTML={{ __html: q.explanation || 'Bu soru için açıklama bulunmamaktadır.' }} />
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Bu sorunun da yer aldığı testi çözerek kendini sına!</p>
          <Link href={`/test/${q.category_id}/${testIndex}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Bu Testi Çözmeye Başla
          </Link>
        </div>
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qId = parseInt(id);
  if (isNaN(qId)) return {};

  const questions = await sql`SELECT question FROM questions WHERE id = ${qId} LIMIT 1`;
  if (!questions || questions.length === 0) return {};

  // Strip HTML for description
  const cleanQuestionText = questions[0].question.replace(/<[^>]*>?/gm, '');

  return {
    title: `Soru #${qId} - KPSS Çıkmış ve Örnek Sorular | SoruEvim`,
    description: cleanQuestionText.substring(0, 150) + '...',
    alternates: {
      canonical: `/soru/${qId}`
    }
  }
}
