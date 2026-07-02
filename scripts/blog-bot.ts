const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const dotenv = require('dotenv');
const { marked } = require('marked');

// .env dosyasını yükle
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('HATA: DATABASE_URL ortam değişkeni bulunamadı!');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const blogDir = path.join(process.cwd(), 'blog');

// Türkçe karakterleri ve boşlukları URL uyumlu hale getiren fonksiyon
function createSlug(filename: string) {
  return filename
    .replace(/\.md$/, '')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Dosyanın son güncellenme anını tutmak için set
const processingFiles = new Set<string>();

async function processFile(filePath: string) {
  if (processingFiles.has(filePath)) return;
  processingFiles.add(filePath);
  
  try {
    const fileBase = path.basename(filePath);
    if (!fileBase.endsWith('.md')) return;

    console.log(`\n⏳ Algılandı: ${fileBase}. İşleniyor...`);
    
    const slug = createSlug(fileBase);
    const contentMarkdown = fs.readFileSync(filePath, 'utf8');
    
    // Satırlara bölüp başlık ve açıklamayı bulma
    const lines = contentMarkdown.split('\n').map((l: string) => l.trim());
    let title = fileBase.replace(/\.md$/, '').replace(/_/g, ' '); // Varsayılan başlık
    let description = '';
    
    // Markdown'ı tarayalım
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('# ')) {
        title = lines[i].replace('# ', ''); // Gerçek başlık
      } else if (lines[i].length > 20 && !lines[i].startsWith('#') && !lines[i].startsWith('-') && !description) {
        description = lines[i].substring(0, 150) + (lines[i].length > 150 ? '...' : ''); // İlk anlamlı paragrafı desc yap
      }
    }

    if (!description) description = title;

    // İçeriği HTML'e çevir
    const contentHtml = marked.parse(contentMarkdown);

    // Veritabanına Ekle veya Güncelle
    await sql`
        INSERT INTO blogs (slug, title, description, content)
        VALUES (${slug}, ${title}, ${description}, ${contentHtml})
        ON CONFLICT (slug) 
        DO UPDATE SET 
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            content = EXCLUDED.content
    `;
    
    console.log(`✅ BAŞARILI: "${title}" (slug: ${slug}) blog veritabanına eklendi/güncellendi!`);
  } catch (error) {
    console.error(`❌ HATA: ${filePath} işlenirken bir sorun oluştu:`, error);
  } finally {
    setTimeout(() => {
      processingFiles.delete(filePath);
    }, 3000);
  }
}

// Chokidar ile klasörü dinleme
console.log('=============================================');
console.log('📝 SoruEvim Blog Dinleme Botu Başlatıldı 📝');
console.log('=============================================');
console.log(`📂 İzlenen klasör: ${blogDir}`);
console.log(`Herhangi bir .md dosyası eklendiğinde/değiştiğinde anında veritabanına yüklenecektir.\n`);

const watcher = chokidar.watch(blogDir, {
  ignored: /(^|[\/\\])\../, // Gizli dosyaları yok say
  persistent: true,
  ignoreInitial: false, // İlk açılışta klasördeki MEVCUT dosyaları da Oku! (Yeni klasör açıldı sonuçta)
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
