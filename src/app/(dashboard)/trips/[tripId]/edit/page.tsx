import { redirect } from 'next/navigation'

interface EditTripPageProps {
  params: Promise<{
    tripId: string
  }>
}

// Redirect to trip view - editing is now done via modal
export default async function EditTripPage({ params }: EditTripPageProps) {
  const { tripId } = await params
  redirect(`/trip/${tripId}`)
}
