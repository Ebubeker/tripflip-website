'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { WaitlistModal } from '@/components/landing/waitlist-modal'

interface NavbarProps {
  variant?: 'default' | 'landing' | 'hero'
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

  const isLanding = variant === 'landing'
  const isHero = variant === 'hero'

  return (
    <header className={`sticky top-0 z-50 w-full ${
      isHero
        ? 'bg-[#0369a1] border-b border-white/10'
        : 'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-black/10'
    }`}>
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-9 h-9">
            <img
              src="/tripflip_logo.png"
              alt="TripFlip"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="relative h-5">
            <img
              src="/logo_text.png"
              alt="TripFlip"
              className="h-full object-contain"
            />
          </div>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {/* Landing-specific links */}
          {isLanding && (
            <>
              <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
                <Link href="/#how-it-works">How It Works</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
                <Link href="/#pricing">Pricing</Link>
              </Button>
            </>
          )}

          <Button
            onClick={() => setIsWaitlistOpen(true)}
            size="sm"
            className={isHero ? 'bg-orange-500 text-white hover:bg-orange-600 border-0' : 'bg-orange-500 text-white hover:bg-orange-600'}
          >
            Join Waitlist
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className={isHero ? 'text-white hover:bg-white/10' : ''}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 pt-6">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative w-9 h-9">
                    <img
                      src="/tripflip_logo.png"
                      alt="TripFlip"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="relative h-9">
                    <img
                      src="/logo_text.png"
                      alt="TripFlip"
                      className="h-full object-contain"
                    />
                  </div>
                </Link>

                {/* Landing-specific links for mobile */}
                {isLanding && (
                  <nav className="flex flex-col gap-3 border-b pb-4">
                    <Link
                      href="/#how-it-works"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-gray-600"
                    >
                      How It Works
                    </Link>
                    <Link
                      href="/#pricing"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-gray-600"
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/#faq"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-gray-600"
                    >
                      FAQ
                    </Link>
                  </nav>
                )}

                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      setIsWaitlistOpen(true)
                    }}
                    className="w-full"
                  >
                    Join Waitlist
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </header>
  )
}
