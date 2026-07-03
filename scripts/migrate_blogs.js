require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('Adding columns to blogs table...');
    await sql`
      ALTER TABLE blogs 
      ADD COLUMN IF NOT EXISTS category_slug VARCHAR(255),
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'cluster',
      ADD COLUMN IF NOT EXISTS pillar_slug VARCHAR(255);
    `;
    console.log('Columns added successfully.');

    console.log('Updating existing records to default values...');
    // We update everything to 'cluster'
    await sql`
      UPDATE blogs 
      SET type = 'cluster', category_slug = 'genel', pillar_slug = 'kpss-genel-rehber'
      WHERE type IS NULL OR type = '';
    `;
    console.log('Records updated.');

    console.log('Inserting dummy pillar...');
    // We insert a pillar so clusters have a parent
    await sql`
      INSERT INTO blogs (slug, title, description, content, category_slug, type, pillar_slug)
      VALUES (
        'kpss-genel-rehber',
        'KPSS Genel Hazırlık Rehberi',
        'KPSS sınavına hazırlık sürecinde ihtiyacınız olan tüm taktikler ve çalışma yöntemleri.',
        '<p>KPSS hazırlık sürecinde başarının sırrı düzenli ve planlı çalışmaktan geçer. Bu ana rehberimizde, alt konularda detaylandırdığımız tüm içeriklerin özetini bulabilirsiniz.</p>',
        'genel',
        'pillar',
        NULL
      )
      ON CONFLICT (slug) DO NOTHING;
    `;
    console.log('Dummy pillar inserted.');

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
