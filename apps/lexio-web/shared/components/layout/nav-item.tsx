'use client';

/**
 * NavItem — sidebar navigation cell: icon + label, active-route highlight.
 * Uses ShadCN Button variant=ghost, sentence-case label, Lucide icon h-4 w-4.
 */
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed?: boolean;
}

export function NavItem({ href, label, icon: Icon, isActive, collapsed = false }: NavItemProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn(
        'w-full justify-start gap-2 px-3',
        isActive && 'bg-accent text-accent-foreground',
        collapsed && 'justify-center px-0',
      )}
    >
      <Link href={href} aria-current={isActive ? 'page' : undefined}>
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        {!collapsed && <span>{label}</span>}
      </Link>
    </Button>
  );
}
