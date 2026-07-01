import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const categories = await sql`SELECT category_id FROM categories ORDER BY id ASC`;
    
    // Temel site URL'i (Vercel ortam değişkenlerinden de alınabilir)
    const baseUrl = `https://${req.headers.host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Ana sayfa
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    const categoryCounts = await sql`SELECT category_id, COUNT(id) as count FROM questions GROUP BY category_id`;

    // Kategori Sayfaları
    for (const cat of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/kategori/${cat.category_id}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;

      // Kategoriye ait testler
      const countRow = categoryCounts.find(c => c.category_id === cat.category_id);
      if (countRow) {
        const totalTests = Math.ceil(parseInt(countRow.count) / 10);
        for (let i = 1; i <= totalTests; i++) {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/test/${cat.category_id}/${i}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.6</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xml);

  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).end();
  }
}
