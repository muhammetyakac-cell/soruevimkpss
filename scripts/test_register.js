require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    const testEmail = 'test-' + Date.now() + '@test.com';
    
    // Check existing
    const existing = await sql`SELECT id FROM users WHERE email = ${testEmail}`;
    console.log('Existing check:', existing.length, 'results');

    // Hash password
    const hash = await bcrypt.hash('Test12345', 10);
    console.log('Hash OK:', hash.substring(0, 20) + '...');

    // Insert user
    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${'Test User'}, ${testEmail}, ${hash})
      RETURNING id, name
    `;
    console.log('INSERT OK:', result);

  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
main();
