'use client';

/**
 * UI primitives section for /design showcase.
 * Covers: buttons, input, card, badge, skeleton, avatar, tabs, dialog, tooltip.
 * All strings sentence case. No shadows beyond border. No gradients.
 */
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { toast } from 'sonner';
import { ThemeToggle } from '@/shared/components/theme-toggle';

export function ComponentsSection() {
  const [inputVal, setInputVal] = useState('');

  return (
    <section aria-labelledby="components-heading" className="flex flex-col gap-10">
      <h2 id="components-heading" className="text-2xl font-semibold text-foreground">
        Components
      </h2>

      {/* ── Buttons ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Buttons</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="default">Primary action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link style</Button>
          <Button disabled>Disabled</Button>
          <ThemeToggle />
        </div>
      </div>

      <Separator />

      {/* ── Input ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Input</h3>
        <div className="flex flex-col gap-2 max-w-sm">
          <Label htmlFor="demo-input">Search decks</Label>
          <Input
            id="demo-input"
            placeholder="Type to search…"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Focus ring uses <code className="font-mono">--ring</code> (indigo).
          </p>
        </div>
      </div>

      <Separator />

      {/* ── Card ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Card</h3>
        <Card className="max-w-sm border border-border shadow-none">
          <CardHeader>
            <CardTitle className="text-base font-medium">Daily streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              You&apos;ve studied 7 days in a row. Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ── Badge ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>

      <Separator />

      {/* ── Skeleton ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Skeleton</h3>
        <div className="flex flex-col gap-2 max-w-sm">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      <Separator />

      {/* ── Avatar ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Avatar</h3>
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <Separator />

      {/* ── Tabs ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Tabs</h3>
        <Tabs defaultValue="overview" className="max-w-sm">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-sm text-muted-foreground pt-3">
            Overview content goes here.
          </TabsContent>
          <TabsContent value="stats" className="text-sm text-muted-foreground pt-3">
            Stats content goes here.
          </TabsContent>
          <TabsContent value="settings" className="text-sm text-muted-foreground pt-3">
            Settings content goes here.
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      {/* ── Dialog ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm action</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This is a sample dialog. No gradients, no shadows — border only.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Confirm</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* ── Tooltip ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Tooltip</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content — sentence case</TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* ── Toast ── */}
      <div>
        <h3 className="text-base font-medium text-foreground mb-3">Toast (sonner)</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast('Note saved')}>
            Default toast
          </Button>
          <Button variant="outline" onClick={() => toast.success('Card marked correct')}>
            Success toast
          </Button>
          <Button variant="outline" onClick={() => toast.error('Failed to sync')}>
            Error toast
          </Button>
          <Button variant="outline" onClick={() => toast.warning('Streak at risk')}>
            Warning toast
          </Button>
        </div>
      </div>
    </section>
  );
}
