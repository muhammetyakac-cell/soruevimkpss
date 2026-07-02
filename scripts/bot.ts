const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const dotenv = require('dotenv');

// .env dosyasını yükle
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('HATA: DATABASE_URL ortam değişkeni bulunamadı!');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const testlerDir = path.join(process.cwd(), 'testler');

// Bu set, gereksiz tekrarları önlemek için dosyanın son güncellenme anını tutar
const processingFiles = new Set<string>();

async function processFile(filePath: string) {
  if (processingFiles.has(filePath)) return;
  processingFiles.add(filePath);
  
  try {
    const fileBase = path.basename(filePath);
    const category_id = path.basename(path.dirname(filePath));

    // Validasyon
    if (!fileBase.endsWith('.md') && !fileBase.endsWith('.txt')) {
      return; // Sadece metin belgeleri
    }

    console.log(`\n⏳ Algılandı: ${category_id}/${fileBase}. İşleniyor...`);
    
    // Veritabanında kategorinin var olup olmadığını kontrol edelim
    const catCheck = await sql`SELECT category_id FROM categories WHERE category_id = ${category_id}`;
    if (catCheck.length === 0) {
      console.warn(`UYARI: ${category_id} kategorisi veritabanında yok. Dosya atlandı.`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // 1. Cevap Anahtarı
    const answerRegex = /\|\s*(\d+)\s*\|\s*([A-E])\s*\|/g;
    const answers: Record<string, string> = {};
    let match;
    while ((match = answerRegex.exec(content)) !== null) {
      answers[match[1]] = match[2];
    }

    // 2. Sorular
    const questionBlocks = content.split(/\*\*Soru \d+:\*\*|Soru \d+:/).slice(1);
    
    let qIndex = 1;
    let importedCount = 0;

    for (const block of questionBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let questionText = '';
      let options: string[] = [];
      
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
        const letterToIndex: { [key: string]: number } = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
        const correctIndex = letterToIndex[correctLetter];

        // Mükerrer soru kontrolü
        const exists = await sql`SELECT id FROM questions WHERE question = ${questionText} AND category_id = ${category_id}`;
        
        if (exists.length === 0) {
          await sql`
              INSERT INTO questions (category_id, question, options, correct_answer, explanation)
              VALUES (${category_id}, ${questionText}, ${JSON.stringify(options)}, ${correctIndex}, ${"Cevap: " + correctLetter})
          `;
          importedCount++;
        }
      }
      qIndex++;
    }

    if (importedCount > 0) {
      console.log(`✅ BAŞARILI: ${category_id}/${fileBase} içinden ${importedCount} yeni soru eklendi!`);
    } else {
      console.log(`ℹ️ BİLGİ: ${category_id}/${fileBase} dosyasında eklenecek YENİ bir soru bulunamadı (zaten ekli olabilir).`);
    }

  } catch (error) {
    console.error(`❌ HATA: ${filePath} işlenirken bir sorun oluştu:`, error);
  } finally {
    // 3 saniye sonra kilit kaldırılır
    setTimeout(() => {
      processingFiles.delete(filePath);
    }, 3000);
  }
}

// Chokidar ile klasörü dinleme
console.log('=============================================');
console.log('🤖 SoruEvim Lokal Test Botu Başlatıldı 🤖');
console.log('=============================================');
console.log(`📂 İzlenen klasör: ${testlerDir}`);
console.log(`Herhangi bir test eklendiğinde anında veritabanına yüklenecektir.\n`);

const watcher = chokidar.watch(testlerDir, {
  ignored: /(^|[\/\\])\../, // Gizli dosyaları yok say
  persistent: true,
  ignoreInitial: true, // Başlangıçta var olan dosyaları tekrar okuma
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 100
  }
});

watcher
  .on('add', (path: string) => processFile(path))
  .on('change', (path: string) => processFile(path))
  .on('error', (error: any) => console.log(`İzleyici Hatası: ${error}`));

export {};
