'use server'
import { neon } from '@neondatabase/serverless'

export async function getMoreClusters(offset: number, limit: number = 20, kategori?: string) {
  const sql = neon(process.env.DATABASE_URL!);
  
  if (kategori) {
    return await sql`SELECT slug, title, description, category_slug, created_at FROM blogs WHERE category_slug = ${kategori} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  } else {
    return await sql`SELECT slug, title, description, category_slug, created_at FROM blogs ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  }
}
