import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function HomePage(): never {
  const token = cookies().get('access_token')?.value;

  if (token) {
    redirect('/player');
  }

  redirect('/login');
}
