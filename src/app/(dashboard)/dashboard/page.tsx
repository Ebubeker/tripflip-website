import { redirect } from 'next/navigation'

// Redirect old dashboard to home page
export default function DashboardPage() {
  redirect('/')
}
