import { MetadataRoute } from 'next'
import { neon } from '@neondatabase/serverless'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sql = neon(process.env.DATABASE_URL!);
  
  const baseUrl = 'https://soruevimkpss.vercel.app';
  
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kayit`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/giris`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    }
  ];

  try {
    const blogs = await sql`SELECT slug, created_at FROM blogs ORDER BY created_at DESC`;
    const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog: any) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.created_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    routes.push(...blogRoutes);
  } catch (error) {
    console.error('Sitemap blog fetch error', error);
  }

  try {
    const categories = await sql`SELECT category_id FROM categories`;
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat: any) => ({
      url: `${baseUrl}/kategori/${cat.category_id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));
    routes.push(...categoryRoutes);
  } catch (error) {
    console.error('Sitemap category fetch error', error);
  }

  return routes;
}
