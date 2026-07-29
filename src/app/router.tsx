import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/components/common/PlaceholderPage'

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
      { path: '/login', element: <PlaceholderPage title="Log in" /> },
      { path: '/signup', element: <PlaceholderPage title="Create your account" /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { path: 'tenant', element: <PlaceholderPage title="Tenant Dashboard" /> },
      { path: 'landlord', element: <PlaceholderPage title="Landlord Dashboard" /> },
      { path: 'agency', element: <PlaceholderPage title="Agency Dashboard" /> },
      { path: 'admin', element: <PlaceholderPage title="Admin Dashboard" /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
