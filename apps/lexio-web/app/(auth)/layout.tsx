/**
 * Auth layout — centered card, NOT-PROD banner at top, no sidebar.
 */
import { NotProdBanner } from '@/shared/components/not-prod-banner';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NotProdBanner />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
