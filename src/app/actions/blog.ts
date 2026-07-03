'use server'
import { neon } from '@neondatabase/serverless'

export async function getMoreClusters(offset: number, limit: number = 20) {
  const sql = neon(process.env.DATABASE_URL!);
  const recent = await sql`SELECT slug, title, description, type, created_at FROM blogs WHERE type = 'cluster' ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  return recent;
}
