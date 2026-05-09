/**
 * greeting — returns a time-of-day greeting string.
 * "Good morning" before 12:00, "Good afternoon" 12–18, "Good evening" 18+.
 * Pure function with no external dependencies.
 */
export function getGreeting(hour?: number): string {
  const h = hour ?? new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
