/**
 * Canonical Lucide icon mapping — doc §12.7.2
 *
 * Rules (§12.5):
 * - Lucide React only (no other icon libraries)
 * - Sizes: h-3 / h-4 / h-5 / h-6 only
 * - strokeWidth={1.5} always
 * - No emoji in functional UI
 *
 * Import from this file, not directly from lucide-react, to enforce
 * the canonical mapping and prevent drift.
 */
export {
  // ── Navigation ──────────────────────────────────────────────────────────
  LayoutDashboard as DashboardIcon,
  BookOpen as DecksIcon,
  Brain as StudyIcon,
  BarChart3 as StatsIcon,
  Trophy as AchievementsIcon,
  Users as CommunityIcon,
  Settings as SettingsIcon,
  LogOut as SignOutIcon,

  // ── Gamification ────────────────────────────────────────────────────────
  Flame as StreakIcon,
  Zap as XpIcon,
  Star as StarIcon,
  Crown as CrownIcon,

  // ── Study / Flashcard ───────────────────────────────────────────────────
  Volume2 as PlayAudioIcon,
  RotateCw as FlipCardIcon,
  CheckCircle2 as CorrectIcon,
  XCircle as IncorrectIcon,
  Shuffle as ShuffleIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,

  // ── Content / Deck ──────────────────────────────────────────────────────
  Plus as AddIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  SortAsc as SortIcon,
  Tag as TagIcon,
  Layers as LayersIcon,

  // ── UI / Utility ─────────────────────────────────────────────────────────
  Sun as SunIcon,
  Moon as MoonIcon,
  Menu as MenuIcon,
  X as CloseIcon,
  Bell as NotificationIcon,
  Info as InfoIcon,
  AlertTriangle as WarningIcon,
  CheckCircle as SuccessIcon,
  AlertOctagon as ErrorIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ExternalLink as ExternalLinkIcon,
  Copy as CopyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Share2 as ShareIcon,
  Loader2 as SpinnerIcon,

  // ── User / Account ───────────────────────────────────────────────────────
  User as UserIcon,
  UserCircle as AvatarIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from 'lucide-react';
