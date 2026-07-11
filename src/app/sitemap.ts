import { MetadataRoute } from 'next'
import { neon } from '@neondatabase/serverless'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sql = neon(process.env.DATABASE_URL!);
  
  const baseUrl = 'https://www.kpssevim.blog';
  
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
    
    // Test sayfaları
    for (const cat of categories) {
      const countRes = await sql`SELECT COUNT(*) FROM questions WHERE category_id = ${cat.category_id}`;
      const totalQuestions = parseInt(countRes[0].count);
      const totalTests = Math.ceil(totalQuestions / 10);
      
      const testRoutes: MetadataRoute.Sitemap = [];
      for (let i = 0; i < totalTests; i++) {
        testRoutes.push({
          url: `${baseUrl}/test/${cat.category_id}/${i}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      }
      routes.push(...testRoutes);
    }
  } catch (error) {
    console.error('Sitemap category/test fetch error', error);
  }

  try {
    // Soru sayfaları - Google limitleri düşünülerek en yeni veya popüler olanlar eklenebilir. 
    // Tümünü eklemek long-tail trafik için çok faydalıdır.
    const questions = await sql`SELECT id FROM questions`;
    const questionRoutes: MetadataRoute.Sitemap = questions.map((q: any) => ({
      url: `${baseUrl}/soru/${q.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
    routes.push(...questionRoutes);
  } catch (error) {
    console.error('Sitemap questions fetch error', error);
  }

  return routes;
}
