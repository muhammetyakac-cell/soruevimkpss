import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const testlerDir = path.join(process.cwd(), 'testler');

    if (!fs.existsSync(testlerDir)) {
      return res.status(400).json({ error: 'testler dizini bulunamadı.' });
    }

    const categories = fs.readdirSync(testlerDir).filter(f => fs.statSync(path.join(testlerDir, f)).isDirectory());
    let totalImported = 0;
    let errors = [];

    // Veritabanındaki mevcut kategorileri önbelleğe alalım (ID bulmak için)
    const dbCategories = await sql`SELECT category_id FROM categories`;
    const validCategoryIds = dbCategories.map(c => c.category_id);

    for (const category_id of categories) {
      if (!validCategoryIds.includes(category_id)) {
        console.warn(`Kategori bulunamadı: ${category_id}. Bu kategori veritabanında yok.`);
        // İsterseniz burada kategoriyi otomatik oluşturabilirsiniz, şimdilik atlıyoruz.
      }

      const catPath = path.join(testlerDir, category_id);
      const files = fs.readdirSync(catPath).filter(f => f.endsWith('.md') || f.endsWith('.txt'));

      for (const file of files) {
        const filePath = path.join(catPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // 1. Cevap Anahtarını Bulalım
        const answerRegex = /\|\s*(\d+)\s*\|\s*([A-E])\s*\|/g;
        const answers = {};
        let match;
        while ((match = answerRegex.exec(content)) !== null) {
          answers[match[1]] = match[2]; // { "1": "D", "2": "B" }
        }

        // 2. Soruları Bulalım
        // Örnek: **Soru 1:** Soru metni\nA) Şık1\nB) Şık2...
        // Soru başlangıcını yakalamak için parçalara ayıralım
        const questionBlocks = content.split(/\*\*Soru \d+:\*\*|Soru \d+:/).slice(1);
        
        let qIndex = 1;
        for (const block of questionBlocks) {
          // Blok içindeki metni satırlara böl
          const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          
          let questionText = '';
          let options = [];
          
          for (const line of lines) {
            if (/^[A-E]\)/.test(line)) {
              options.push(line);
            } else if (line === '---' || line.startsWith('##')) {
              break; // Cevap anahtarına geldik
            } else if (options.length === 0) {
              questionText += (questionText ? ' ' : '') + line;
            }
          }

          const qNumberStr = qIndex.toString();
          const correctLetter = answers[qNumberStr];

          if (questionText && options.length > 0 && correctLetter) {
            const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
            const correctIndex = letterToIndex[correctLetter];

            // Veritabanında aynı soru var mı kontrol et
            const exists = await sql`SELECT id FROM questions WHERE question = ${questionText} AND category_id = ${category_id}`;
            
            if (exists.length === 0) {
              await sql`
                  INSERT INTO questions (category_id, question, options, correct_answer, explanation)
                  VALUES (${category_id}, ${questionText}, ${JSON.stringify(options)}, ${correctIndex}, ${"Cevap: " + correctLetter})
              `;
              totalImported++;
            }
          } else {
             errors.push(`Parse hatası: ${file} - Soru ${qIndex} eksik bilgi içeriyor. (Soru, Şık veya Cevap Anahtarı)`);
          }
          qIndex++;
        }
      }
    }

    res.status(200).json({ 
      message: `${totalImported} adet yeni soru başarıyla içeri aktarıldı.`,
      errors: errors 
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'İçe aktarma hatası', details: error.message });
  }
}
