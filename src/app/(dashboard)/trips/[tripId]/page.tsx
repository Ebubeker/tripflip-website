import { redirect } from 'next/navigation'

interface TripPageProps {
  params: Promise<{
    tripId: string
  }>
}

// Redirect to simplified trip view
export default async function TripPage({ params }: TripPageProps) {
  const { tripId } = await params
  redirect(`/trip/${tripId}`)
}
