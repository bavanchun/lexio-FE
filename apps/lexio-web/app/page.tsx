/**
 * Root page — temporary redirect to /design showcase.
 * Will be replaced with the real app shell in phase-06.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/design');
}
