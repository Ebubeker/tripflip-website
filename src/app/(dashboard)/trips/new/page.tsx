import { redirect } from 'next/navigation'

// Redirect to home page - use the trip finder on home to create new trips
export default function NewTripPage() {
  redirect('/')
}
