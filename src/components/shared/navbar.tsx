'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, User, LogOut, Map, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  variant?: 'default' | 'landing' | 'hero'
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = createClient()

  const isLanding = variant === 'landing'
  const isHero = variant === 'hero'

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

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

          {/* Explore link - always visible */}
          <Button variant="ghost" size="sm" asChild className={isHero ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900'}>
            <Link href="/explore">
              <Compass className="h-4 w-4 mr-2" />
              Explore
            </Link>
          </Button>

          {/* User-specific links */}
          {user && (
            <>
              <Button variant="ghost" size="sm" asChild className={isHero ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900'}>
                <Link href="/plan">
                  Plan Trip
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className={isHero ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900'}>
                <Link href="/trips">
                  <Map className="h-4 w-4 mr-2" />
                  My Trips
                </Link>
              </Button>
            </>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative h-9 w-9 rounded-full ${isHero ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={isHero ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/plan" className="cursor-pointer">
                    <Compass className="mr-2 h-4 w-4" />
                    Plan Trip
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trips" className="cursor-pointer">
                    <Map className="mr-2 h-4 w-4" />
                    My Trips
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isAuthPage && (
            <>
              <Button variant="ghost" size="sm" asChild className={isHero ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900'}>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className={isHero ? 'bg-orange-500 text-white hover:bg-orange-600 border-0' : 'bg-orange-500 text-white hover:bg-orange-600'}>
                <Link href="/plan">Get Started</Link>
              </Button>
            </>
          )}
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

                {user ? (
                  <nav className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/plan"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium"
                    >
                      <Compass className="h-5 w-5 text-primary" />
                      Plan Trip
                    </Link>
                    <Link
                      href="/trips"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium"
                    >
                      <Map className="h-5 w-5 text-primary" />
                      My Trips
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium"
                    >
                      <User className="h-5 w-5 text-primary" />
                      Profile
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                      className="mt-4"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </nav>
                ) : (
                  <div className="flex flex-col gap-3 pt-4">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/plan" onClick={() => setIsOpen(false)}>
                        Start Planning
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
