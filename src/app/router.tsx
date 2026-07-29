import { Outlet, createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { ChooseRolePage } from '@/pages/ChooseRolePage'
import { VerifyPhonePage } from '@/pages/VerifyPhonePage'
import { TenantOverviewPage } from '@/pages/TenantOverviewPage'
import { TenantSavedListingsPage } from '@/pages/TenantSavedListingsPage'
import { LandlordOverviewPage } from '@/pages/LandlordOverviewPage'
import { AgencyOverviewPage } from '@/pages/AgencyOverviewPage'
import { AgencyTeamPage } from '@/pages/AgencyTeamPage'
import { AgencyProfilePage } from '@/pages/AgencyProfilePage'
import { AdminOverviewPage } from '@/pages/AdminOverviewPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { AdminAgenciesPage } from '@/pages/AdminAgenciesPage'
import { AdminFraudFlagsPage } from '@/pages/AdminFraudFlagsPage'
import { AdminListingsPage } from '@/pages/AdminListingsPage'
import { TrustScorePage } from '@/pages/TrustScorePage'
import { AccountProfilePage } from '@/pages/AccountProfilePage'
import { ListingsPage } from '@/pages/ListingsPage'
import { PropertyDetailPage } from '@/pages/PropertyDetailPage'
import { PropertyListPage } from '@/pages/PropertyListPage'
import { PropertyCreatePage } from '@/pages/PropertyCreatePage'
import { PropertyEditPage } from '@/pages/PropertyEditPage'
import { PlaceholderPage } from '@/components/common/PlaceholderPage'
import {
  RequireAuth,
  RequireProfile,
  RequireRole,
  DashboardIndexRedirect,
} from '@/app/route-guards'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/listings', element: <ListingsPage /> },
      { path: '/listings/:id', element: <PropertyDetailPage /> },
      {
        path: '/list-property',
        element: (
          <PlaceholderPage title="List Your Property" description="Landlord onboarding" />
        ),
      },
      {
        path: '/how-it-works',
        element: <PlaceholderPage title="How It Works" />,
      },
      {
        path: '/verified-before-you-travel',
        element: <PlaceholderPage title="Verified Before You Travel" />,
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      {
        path: '/choose-role',
        element: (
          <RequireAuth>
            <ChooseRolePage />
          </RequireAuth>
        ),
      },
      {
        path: '/verify-phone',
        element: (
          <RequireAuth>
            <VerifyPhonePage />
          </RequireAuth>
        ),
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <RequireProfile>
        <DashboardLayout />
      </RequireProfile>
    ),
    children: [
      { index: true, element: <DashboardIndexRedirect /> },
      {
        path: 'tenant',
        element: (
          <RequireRole roles={['tenant']}>
            <Outlet />
          </RequireRole>
        ),
        children: [
          { index: true, element: <TenantOverviewPage /> },
          { path: 'saved', element: <TenantSavedListingsPage /> },
          {
            path: 'bookings',
            element: (
              <PlaceholderPage
                title="Your bookings"
                description="Viewing requests will appear here once you book your first one."
              />
            ),
          },
          {
            path: 'messages',
            element: (
              <PlaceholderPage
                title="Messages"
                description="In-app messaging with landlords and agencies is coming soon."
              />
            ),
          },
          { path: 'profile', element: <AccountProfilePage /> },
        ],
      },
      {
        path: 'landlord',
        element: (
          <RequireRole roles={['landlord']}>
            <Outlet />
          </RequireRole>
        ),
        children: [
          { index: true, element: <LandlordOverviewPage /> },
          { path: 'properties', element: <PropertyListPage /> },
          { path: 'properties/new', element: <PropertyCreatePage /> },
          { path: 'properties/:id/edit', element: <PropertyEditPage /> },
          {
            path: 'bookings',
            element: (
              <PlaceholderPage
                title="Bookings"
                description="Viewing requests and Verified Before You Travel confirmations will appear here once the booking system lands."
              />
            ),
          },
          { path: 'trust-score', element: <TrustScorePage /> },
          { path: 'profile', element: <AccountProfilePage /> },
        ],
      },
      {
        path: 'agency',
        element: (
          <RequireRole roles={['agency']}>
            <Outlet />
          </RequireRole>
        ),
        children: [
          { index: true, element: <AgencyOverviewPage /> },
          { path: 'properties', element: <PropertyListPage /> },
          { path: 'properties/new', element: <PropertyCreatePage /> },
          { path: 'properties/:id/edit', element: <PropertyEditPage /> },
          {
            path: 'bookings',
            element: (
              <PlaceholderPage
                title="Bookings"
                description="Viewing requests and Verified Before You Travel confirmations will appear here once the booking system lands."
              />
            ),
          },
          { path: 'team', element: <AgencyTeamPage /> },
          { path: 'trust-score', element: <TrustScorePage /> },
          { path: 'agency-profile', element: <AgencyProfilePage /> },
          { path: 'account', element: <AccountProfilePage /> },
        ],
      },
      {
        path: 'admin',
        element: (
          <RequireRole roles={['admin']}>
            <Outlet />
          </RequireRole>
        ),
        children: [
          { index: true, element: <AdminOverviewPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'agencies', element: <AdminAgenciesPage /> },
          { path: 'listings', element: <AdminListingsPage /> },
          { path: 'fraud-flags', element: <AdminFraudFlagsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
