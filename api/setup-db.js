import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Sadece yetkili/post isteğiyle çalışması iyi olur ama şimdilik geliştirme için GET kabul edelim
  if (req.query.secret !== process.env.SETUP_SECRET && !process.env.IS_LOCAL) {
     // return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Tabloları oluştur
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        category_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(100) NOT NULL,
        icon VARCHAR(10),
        description TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        category_id VARCHAR(50) REFERENCES categories(category_id),
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL,
        explanation TEXT
      );
    `;

    // Verileri JSON dosyalarından oku ve ekle
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        return res.status(400).json({ error: 'Data dizini bulunamadı. JSON dosyaları silinmiş olabilir.' });
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        // Kategoriyi ekle (varsa yoksay)
        await sql`
            INSERT INTO categories (category_id, title, icon, description) 
            VALUES (${data.id}, ${data.category}, ${data.icon}, ${data.description})
            ON CONFLICT (category_id) DO NOTHING;
        `;

        // Soruları ekle
        for (const q of data.questions) {
            // Önce sorunun var olup olmadığına bak (basit bir mantıkla question_text ile arayalım)
            const exists = await sql`SELECT id FROM questions WHERE question = ${q.question} AND category_id = ${data.id}`;
            if (exists.length === 0) {
                await sql`
                    INSERT INTO questions (category_id, question, options, correct_answer, explanation)
                    VALUES (${data.id}, ${q.question}, ${JSON.stringify(q.options)}, ${q.correctAnswer}, ${q.explanation})
                `;
            }
        }
    }

    res.status(200).json({ message: 'Veritabanı kurulumu ve veri aktarımı başarıyla tamamlandı!' });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Kurulum hatası', details: error.message });
  }
}
