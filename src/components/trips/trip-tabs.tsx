'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Plane,
  Hotel,
  DollarSign,
  Image,
  Map,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TripTabsProps {
  tripId: string
}

const tabs = [
  {
    href: '',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/itinerary',
    label: 'Itinerary',
    icon: Calendar,
  },
  {
    href: '/flights',
    label: 'Flights',
    icon: Plane,
  },
  {
    href: '/accommodations',
    label: 'Stays',
    icon: Hotel,
  },
  {
    href: '/budget',
    label: 'Budget',
    icon: DollarSign,
  },
  {
    href: '/photos',
    label: 'Photos',
    icon: Image,
  },
  {
    href: '/map',
    label: 'Map',
    icon: Map,
  },
]

export function TripTabs({ tripId }: TripTabsProps) {
  const pathname = usePathname()
  const basePath = `/trips/${tripId}`

  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Trip tabs">
        {tabs.map((tab) => {
          const href = `${basePath}${tab.href}`
          const isActive = tab.href === ''
            ? pathname === basePath
            : pathname.startsWith(href)

          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
