'use server'

import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function saveProgress(categoryId: string, testIndex: number, correct: number, wrong: number, empty: number, details: any) {
  const session = await getSession()
  
  // Eğer kullanıcı giriş yapmamışsa, anonim test çözebilir ama veritabanına kaydedilmez.
  if (!session || !session.userId) {
    return { success: false, error: 'Oturum bulunamadı' }
  }

  try {
    // Upsert (Insert or Update) if already solved
    await sql`
      INSERT INTO user_progress (user_id, category_id, test_index, correct, wrong, empty, details)
      VALUES (${session.userId}, ${categoryId}, ${testIndex}, ${correct}, ${wrong}, ${empty}, ${JSON.stringify(details)})
      ON CONFLICT (user_id, category_id, test_index) 
      DO UPDATE SET 
        correct = EXCLUDED.correct,
        wrong = EXCLUDED.wrong,
        empty = EXCLUDED.empty,
        details = EXCLUDED.details,
        completed_at = CURRENT_TIMESTAMP
    `
    return { success: true }
  } catch (error) {
    console.error('Save progress error:', error)
    return { success: false, error: 'Kaydedilemedi' }
  }
}
