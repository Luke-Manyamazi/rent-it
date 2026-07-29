import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { ChooseRolePage } from '@/pages/ChooseRolePage'
import { VerifyPhonePage } from '@/pages/VerifyPhonePage'
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
      {
        path: '/listings',
        element: (
          <PlaceholderPage
            title="Browse Rentals"
            description="Search and filtering lands in a later phase."
          />
        ),
      },
      {
        path: '/listings/:id',
        element: <PlaceholderPage title="Property Details" />,
      },
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
            <PlaceholderPage title="Tenant Dashboard" />
          </RequireRole>
        ),
      },
      {
        path: 'landlord',
        element: (
          <RequireRole roles={['landlord']}>
            <PlaceholderPage title="Landlord Dashboard" />
          </RequireRole>
        ),
      },
      {
        path: 'agency',
        element: (
          <RequireRole roles={['agency']}>
            <PlaceholderPage title="Agency Dashboard" />
          </RequireRole>
        ),
      },
      {
        path: 'admin',
        element: (
          <RequireRole roles={['admin']}>
            <PlaceholderPage title="Admin Dashboard" />
          </RequireRole>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
