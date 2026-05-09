'use client';

/**
 * LoginForm — email + displayName inputs (RHF + Zod).
 * No password field — this prototype does not store passwords.
 * On submit → signIn(email, displayName) → router.push('/dashboard').
 */
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
// eslint-disable-next-line boundaries/dependencies -- intra-feature: same feature barrel sub-module
import { useAuthStore } from '../store/auth-store';

const loginSchema = z.object({
  email: z.string().min(1, 'Required').email('Enter a valid email'),
  displayName: z.string().min(1, 'Required').max(60),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    await signIn(values.email, values.displayName);
    router.push('/dashboard');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">{t('displayName')}</Label>
        <Input
          id="displayName"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          aria-invalid={!!errors.displayName}
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="text-xs text-destructive" role="alert">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t('signingIn') : t('signInButton')}
      </Button>
    </form>
  );
}
