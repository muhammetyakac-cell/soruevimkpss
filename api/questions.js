import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Kategori listesini getir (sadece kategoriler)
    if (req.query.type === 'categories') {
      const categories = await sql`SELECT id, category_id, title, icon, description FROM categories ORDER BY id ASC`;
      
      // Her kategori için toplam soru sayısını bul
      for (let cat of categories) {
        const countRes = await sql`SELECT COUNT(*) FROM questions WHERE category_id = ${cat.category_id}`;
        cat.totalQuestions = parseInt(countRes[0].count);
      }
      
      return res.status(200).json(categories);
    }

    // Belirli bir kategorinin sorularını getir
    if (req.query.categoryId) {
      const questions = await sql`
        SELECT id, question, options, correct_answer, explanation 
        FROM questions 
        WHERE category_id = ${req.query.categoryId}
      `;
      
      // JSON tipini uygun nesneye çevirme
      const formatted = questions.map(q => ({
        id: q.id,
        question: q.question,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation
      }));

      return res.status(200).json(formatted);
    }

    res.status(400).json({ error: 'Geçersiz istek. type=categories veya categoryId parametresi gerekli.' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Veritabanı hatası', details: error.message });
  }
}
