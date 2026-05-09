/**
 * /dashboard — placeholder until phase-09 fills this with real data.
 */
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const metadata = { title: 'Dashboard — Lexio' };

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('comingSoon')}</p>
      <Link
        href="/study/new"
        className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Start studying
      </Link>
    </div>
  );
}
