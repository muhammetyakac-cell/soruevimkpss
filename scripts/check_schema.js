require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log('=== users table columns ===');
    const cols = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
    console.log(JSON.stringify(cols, null, 2));

    console.log('\n=== user_progress table columns ===');
    const cols2 = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'user_progress' ORDER BY ordinal_position`;
    console.log(JSON.stringify(cols2, null, 2));
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
main();
