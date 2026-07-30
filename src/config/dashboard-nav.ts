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
  FlagTriangleRight,
  CreditCard,
  BarChart3,
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
  { label: 'Messages', href: '/dashboard/landlord/messages', icon: MessageCircle },
  { label: 'Analytics', href: '/dashboard/landlord/analytics', icon: BarChart3 },
  { label: 'Trust score', href: '/dashboard/landlord/trust-score', icon: ShieldCheck },
  { label: 'Profile', href: '/dashboard/landlord/profile', icon: UserCircle },
]

const AGENCY_NAV: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard/agency', icon: LayoutDashboard, end: true },
  { label: 'Properties', href: '/dashboard/agency/properties', icon: Home },
  { label: 'Bookings', href: '/dashboard/agency/bookings', icon: CalendarClock },
  { label: 'Messages', href: '/dashboard/agency/messages', icon: MessageCircle },
  { label: 'Analytics', href: '/dashboard/agency/analytics', icon: BarChart3 },
  { label: 'Team', href: '/dashboard/agency/team', icon: Users },
  { label: 'Trust score', href: '/dashboard/agency/trust-score', icon: ShieldCheck },
  { label: 'Subscription', href: '/dashboard/agency/subscription', icon: CreditCard },
  { label: 'Agency profile', href: '/dashboard/agency/agency-profile', icon: Building2 },
  { label: 'My account', href: '/dashboard/agency/account', icon: UserCircle },
]

const ADMIN_NAV: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard, end: true },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
  { label: 'Users', href: '/dashboard/admin/users', icon: Users },
  { label: 'Agencies', href: '/dashboard/admin/agencies', icon: Building2 },
  { label: 'Listings', href: '/dashboard/admin/listings', icon: Home },
  { label: 'Fraud reports', href: '/dashboard/admin/fraud-flags', icon: FlagTriangleRight },
  { label: 'Subscriptions', href: '/dashboard/admin/subscriptions', icon: CreditCard },
]

export function getDashboardNavItems(role: UserRole): DashboardNavItem[] {
  if (role === 'tenant') return TENANT_NAV
  if (role === 'landlord') return LANDLORD_NAV
  if (role === 'agency') return AGENCY_NAV
  return ADMIN_NAV
}
