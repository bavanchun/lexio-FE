/**
 * Heatmap sample + Lucide icon grid for /design showcase.
 * Heatmap: monochromatic Zinc → Indigo per §12.5 rule 8.
 * Icons: sample from canonical mapping, strokeWidth=1.5, h-5.
 */
import {
  DashboardIcon,
  DecksIcon,
  StudyIcon,
  StatsIcon,
  AchievementsIcon,
  CommunityIcon,
  SettingsIcon,
  SignOutIcon,
  StreakIcon,
  XpIcon,
  PlayAudioIcon,
  FlipCardIcon,
  CorrectIcon,
  IncorrectIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  NotificationIcon,
  SpinnerIcon,
  UserIcon,
  LockIcon,
} from '@/shared/icons';

/** Heatmap swatch: Zinc-200 → Zinc-400 → Indigo-300 → Indigo-500 → Indigo-700 */
const heatmapSwatches = [
  { label: 'Empty', bg: 'bg-zinc-200 dark:bg-zinc-800' },
  { label: 'Low', bg: 'bg-zinc-400 dark:bg-zinc-600' },
  { label: 'Medium', bg: 'bg-indigo-300 dark:bg-indigo-400' },
  { label: 'High', bg: 'bg-indigo-500' },
  { label: 'Max', bg: 'bg-indigo-700' },
];

const iconEntries = [
  { Icon: DashboardIcon, name: 'Dashboard' },
  { Icon: DecksIcon, name: 'Decks' },
  { Icon: StudyIcon, name: 'Study' },
  { Icon: StatsIcon, name: 'Stats' },
  { Icon: AchievementsIcon, name: 'Achievements' },
  { Icon: CommunityIcon, name: 'Community' },
  { Icon: SettingsIcon, name: 'Settings' },
  { Icon: SignOutIcon, name: 'Sign out' },
  { Icon: StreakIcon, name: 'Streak' },
  { Icon: XpIcon, name: 'XP' },
  { Icon: PlayAudioIcon, name: 'Play audio' },
  { Icon: FlipCardIcon, name: 'Flip card' },
  { Icon: CorrectIcon, name: 'Correct' },
  { Icon: IncorrectIcon, name: 'Incorrect' },
  { Icon: AddIcon, name: 'Add' },
  { Icon: EditIcon, name: 'Edit' },
  { Icon: DeleteIcon, name: 'Delete' },
  { Icon: SearchIcon, name: 'Search' },
  { Icon: NotificationIcon, name: 'Notification' },
  { Icon: SpinnerIcon, name: 'Spinner' },
  { Icon: UserIcon, name: 'User' },
  { Icon: LockIcon, name: 'Lock' },
] as const;

export function HeatmapIconsSection() {
  return (
    <>
      {/* ── Heatmap sample ── */}
      <section aria-labelledby="heatmap-heading">
        <h2 id="heatmap-heading" className="text-2xl font-semibold text-foreground mb-4">
          Heatmap palette
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Monochromatic Zinc → Indigo ramp (§12.5 rule 8). No rainbow.
        </p>
        <div className="flex gap-2 items-end">
          {heatmapSwatches.map(({ label, bg }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className={`${bg} h-8 w-8 rounded border border-border`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Icon grid ── */}
      <section aria-labelledby="icons-heading">
        <h2 id="icons-heading" className="text-2xl font-semibold text-foreground mb-2">
          Lucide icon map
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          All icons from <code className="font-mono text-xs">@/shared/icons</code>. strokeWidth=1.5,
          h-5. Sizes h-3/4/5/6 only per §12.7.2.
        </p>
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
          {iconEntries.map(({ Icon, name }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 p-3 rounded border border-border bg-card"
            >
              <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <span className="text-xs text-muted-foreground text-center leading-tight">
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
