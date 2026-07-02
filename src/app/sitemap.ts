import { MetadataRoute } from 'next'
import { sql } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://soruevimkpss.vercel.app'
  
  // Static Routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ]

  // Kategoriler
  const categories = await sql`SELECT category_id FROM categories`
  categories.forEach((cat) => {
    routes.push({
      url: `${baseUrl}/kategori/${cat.category_id}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })
  })

  // Soru Sayfaları (Örnek: İlk 1000 soruyu sitemapa ekleyebiliriz)
  const questions = await sql`SELECT id FROM questions ORDER BY id DESC LIMIT 5000`
  questions.forEach((q) => {
    routes.push({
      url: `${baseUrl}/soru/${q.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  })

  // Blog Sayfaları (Dinamik)
  const blogs = await sql`SELECT slug, created_at FROM blogs`;
  blogs.forEach((b) => {
    routes.push({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: new Date(b.created_at || new Date()),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  })

  return routes as MetadataRoute.Sitemap
}
