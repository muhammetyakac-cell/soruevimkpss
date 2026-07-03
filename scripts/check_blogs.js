require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const result = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'blogs'`;
  console.log(JSON.stringify(result, null, 2));
}
check();
