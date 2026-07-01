const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Test içe aktarma robotu başlatılıyor...');
  
  if (!process.env.DATABASE_URL) {
    console.error('HATA: DATABASE_URL ortam değişkeni bulunamadı!');
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const testlerDir = path.join(process.cwd(), 'testler');

    if (!fs.existsSync(testlerDir)) {
      console.error('HATA: testler dizini bulunamadı.');
      process.exit(1);
    }

    const categories = fs.readdirSync(testlerDir).filter(f => fs.statSync(path.join(testlerDir, f)).isDirectory());
    let totalImported = 0;
    let errors = [];

    // Veritabanındaki mevcut kategorileri önbelleğe alalım (ID bulmak için)
    const dbCategories = await sql`SELECT category_id FROM categories`;
    const validCategoryIds = dbCategories.map(c => c.category_id);

    for (const category_id of categories) {
      if (!validCategoryIds.includes(category_id)) {
        console.warn(`UYARI: Kategori bulunamadı: ${category_id}. Bu kategori veritabanında yok.`);
        continue;
      }

      console.log(`-> Kategori taranıyor: ${category_id}`);
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
          answers[match[1]] = match[2];
        }

        // 2. Soruları Bulalım
        const questionBlocks = content.split(/\*\*Soru \d+:\*\*|Soru \d+:/).slice(1);
        
        let qIndex = 1;
        let importedFromFile = 0;

        for (const block of questionBlocks) {
          const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          
          let questionText = '';
          let options = [];
          
          for (const line of lines) {
            if (/^[A-E]\)/.test(line)) {
              options.push(line);
            } else if (line === '---' || line.startsWith('##')) {
              break;
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
              importedFromFile++;
            }
          } else {
             errors.push(`Parse hatası: ${category_id}/${file} - Soru ${qIndex} eksik bilgi içeriyor.`);
          }
          qIndex++;
        }
        if (importedFromFile > 0) {
          console.log(`   * ${file}: ${importedFromFile} yeni soru eklendi.`);
        }
      }
    }

    console.log(`\nBAŞARILI: Toplam ${totalImported} yeni soru içeri aktarıldı.`);
    if (errors.length > 0) {
      console.warn('Bazı hatalar oluştu:');
      errors.forEach(e => console.warn(e));
    }
    
    process.exit(0);

  } catch (error) {
    console.error('HATA: İçe aktarma işlemi başarısız oldu:', error);
    process.exit(1);
  }
}

run();
