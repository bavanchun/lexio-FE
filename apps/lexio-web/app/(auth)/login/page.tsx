/**
 * /login — stub authentication page.
 * Email + display name only. No password field (prototype does not store passwords).
 */
import { getTranslations } from 'next-intl/server';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata = {
  title: 'Sign in — Lexio',
};

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <Card>
      <CardHeader className="pb-4 text-center">
        <p className="mb-1 text-2xl font-medium text-indigo-600 dark:text-indigo-400">Lexio</p>
        <CardTitle className="text-xl">{t('signIn')}</CardTitle>
        <CardDescription>{t('signInDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
