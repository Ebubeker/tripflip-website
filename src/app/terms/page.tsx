import { Navbar } from '@/components/shared/navbar'
import { LandingFooter } from '@/components/landing'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | TripFlip',
  description: 'Terms of Service for TripFlip - AI-powered travel planning platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="landing" />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-gray">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            <p className="text-gray-600 mb-8">Last updated: January 27, 2026</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing or using TripFlip ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4">
                TripFlip is an AI-powered travel planning platform that helps users plan trips by providing flight searches, hotel recommendations, itinerary suggestions, and budget tracking tools. The Service is provided "as is" and "as available."
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                To use certain features of the Service, you must register for an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Providing accurate and complete registration information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Booking and Third-Party Services</h2>
              <p className="text-gray-600 mb-4">
                TripFlip facilitates connections to third-party booking services for flights, hotels, and other travel services. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>The availability, pricing, or quality of third-party services</li>
                <li>Changes to bookings made through third-party providers</li>
                <li>Disputes between you and third-party service providers</li>
                <li>The accuracy of information provided by third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription and Payments</h2>
              <p className="text-gray-600 mb-4">
                Paid subscriptions are billed on a recurring basis (monthly or annually). By subscribing, you authorize us to charge your payment method. You may cancel your subscription at any time, and cancellation will take effect at the end of the current billing period.
              </p>
              <p className="text-gray-600 mb-4">
                We offer a 14-day money-back guarantee for all paid plans. Refund requests must be made within 14 days of the subscription start date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Acceptable Use</h2>
              <p className="text-gray-600 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Share your account credentials with others</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Violate the intellectual property rights of TripFlip or others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                The Service, including its content, features, and functionality, is owned by TripFlip and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                To the maximum extent permitted by law, TripFlip shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-gray-600 mb-4">
                The Service is provided "as is" without warranties of any kind, whether express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-600 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TripFlip operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-600">
                Email: legal@tripflip.app
              </p>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
