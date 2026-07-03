import { sql } from '@/lib/db'
import { notFound } from 'next/navigation'
import QuizClient from '@/components/QuizClient'

export const revalidate = 60

export default async function TestPage({ params }: { params: Promise<{ category: string, id: string }> }) {
  const { category: categoryId, id: testId } = await params;
  const testIndex = parseInt(testId);

  if (isNaN(testIndex)) {
    notFound();
  }

  // Kategoriyi doğrula
  const cats = await sql`SELECT * FROM categories WHERE category_id = ${categoryId} LIMIT 1`;
  if (!cats || cats.length === 0) {
    notFound();
  }
  const category = cats[0];

  // Soruları çek (tümünü çekip ilgili dilimi alıyoruz)
  const questions = await sql`
    SELECT id, question, options, correct_answer as "correctAnswer", explanation 
    FROM questions 
    WHERE category_id = ${categoryId} 
    ORDER BY id ASC
  `;

  const startIndex = testIndex * 10;
  const testQuestions = questions.slice(startIndex, startIndex + 10);

  if (testQuestions.length === 0) {
    notFound();
  }

  // Parse JSON options if string
  const formattedQuestions = testQuestions.map(q => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
  }));

  return (
    <section className={`page-section active theme-${categoryId}`} style={{ display: 'block' }}>
      <QuizClient 
        category={category} 
        testIndex={testIndex} 
        questions={formattedQuestions} 
      />
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }) {
  const { category, id } = await params;
  return {
    title: `Test ${parseInt(id) + 1} - ${category.toUpperCase()} KPSS - SoruEvim`,
    description: `${category} alanında Test ${parseInt(id) + 1}. Gerçek sınav deneyimi ile çözün.`
  }
}
