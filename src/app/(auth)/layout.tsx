import Link from 'next/link'
import { Plane } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
            <Plane className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">TripFlip</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;TripFlip made planning our honeymoon incredibly easy. The AI
              suggestions were spot-on, and having everything in one place saved
              us hours of research.&rdquo;
            </p>
            <footer className="text-sm opacity-80">— Sarah & Mike, traveled to Japan</footer>
          </blockquote>
        </div>

        <div className="text-sm opacity-70">
          <p>Plan smarter. Travel better.</p>
          <p>&copy; {new Date().getFullYear()} TripFlip. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TripFlip</span>
          </Link>
        </div>

        {/* Auth content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
