import {
  LayoutDashboard,
  Heart,
  CalendarClock,
  MessageCircle,
  UserCircle,
  Home,
  ShieldCheck,
  Users,
  Building2,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types/user'

export interface DashboardNavItem {
  label: string
  href: string
  icon: LucideIcon
  end?: boolean
}

const TENANT_NAV: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard/tenant', icon: LayoutDashboard, end: true },
  { label: 'Saved listings', href: '/dashboard/tenant/saved', icon: Heart },
  { label: 'Bookings', href: '/dashboard/tenant/bookings', icon: CalendarClock },
  { label: 'Messages', href: '/dashboard/tenant/messages', icon: MessageCircle },
  { label: 'Profile', href: '/dashboard/tenant/profile', icon: UserCircle },
]

const LANDLORD_NAV: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard/landlord', icon: LayoutDashboard, end: true },
  { label: 'My properties', href: '/dashboard/landlord/properties', icon: Home },
  { label: 'Bookings', href: '/dashboard/landlord/bookings', icon: CalendarClock },
  { label: 'Trust score', href: '/dashboard/landlord/trust-score', icon: ShieldCheck },
  { label: 'Profile', href: '/dashboard/landlord/profile', icon: UserCircle },
]

const AGENCY_NAV: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard/agency', icon: LayoutDashboard, end: true },
  { label: 'Properties', href: '/dashboard/agency/properties', icon: Home },
  { label: 'Bookings', href: '/dashboard/agency/bookings', icon: CalendarClock },
  { label: 'Team', href: '/dashboard/agency/team', icon: Users },
  { label: 'Trust score', href: '/dashboard/agency/trust-score', icon: ShieldCheck },
  { label: 'Agency profile', href: '/dashboard/agency/agency-profile', icon: Building2 },
  { label: 'My account', href: '/dashboard/agency/account', icon: UserCircle },
]

// Admin dashboard is built in a later phase — a single link keeps the
// shared DashboardLayout sidebar meaningful until then.
const ADMIN_NAV: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard, end: true },
]

export function getDashboardNavItems(role: UserRole): DashboardNavItem[] {
  if (role === 'tenant') return TENANT_NAV
  if (role === 'landlord') return LANDLORD_NAV
  if (role === 'agency') return AGENCY_NAV
  return ADMIN_NAV
}
