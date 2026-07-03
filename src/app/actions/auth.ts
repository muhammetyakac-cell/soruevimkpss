'use server'

import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession, destroySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function register(prevState: { error: string | null } | undefined, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'Lütfen tüm alanları doldurun.' };
  }

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return { error: 'Bu email adresi zaten kullanılıyor.' };
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${hash})
      RETURNING id, name
    `;

    const user = result[0];
    await createSession(user.id, user.name);
  } catch (error) {
    console.error('Register error:', error);
    return { error: 'Kayıt olurken bir hata oluştu.' };
  }

  redirect('/');
}

export async function login(prevState: { error: string | null } | undefined, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email ve şifre gereklidir.' };
  }

  try {
    const users = await sql`SELECT id, name, password_hash FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      return { error: 'Geçersiz email veya şifre.' };
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return { error: 'Geçersiz email veya şifre.' };
    }

    await createSession(user.id, user.name);
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Giriş yaparken bir hata oluştu.' };
  }

  redirect('/');
}

export async function logout() {
  await destroySession();
  redirect('/');
}
