import { Link } from 'react-router-dom'
import { APP_NAME, APP_TAGLINE } from '@/config/constants'

const FOOTER_COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Browse Rentals', href: '/listings' },
      { label: 'List Your Property', href: '/list-property' },
      { label: 'For Agencies', href: '/agencies' },
    ],
  },
  {
    title: 'Trust & Safety',
    links: [
      { label: 'How Verification Works', href: '/how-it-works' },
      { label: 'Verified Before You Travel', href: '/verified-before-you-travel' },
      { label: 'Report a Listing', href: '/report' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-secondary/40 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="font-semibold">{APP_NAME}</p>
            <p className="text-muted-foreground mt-2 text-sm">{APP_TAGLINE}</p>
            <p className="text-muted-foreground mt-4 text-xs">
              Serving Masvingo, Zimbabwe.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mt-10 border-t pt-6 text-xs">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
