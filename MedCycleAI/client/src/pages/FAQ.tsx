import { Link } from 'wouter';

export default function FAQ() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">1. What is MedCycle?</h2>
          <p>MedCycle is an AI-powered medicine redistribution network that connects healthcare entities to redistribute sealed, safe, near-expiry medicines.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">2. How can I donate medicines?</h2>
          <p>You can register as a donor, list your medicines, and wait for admin approval before shipping them to verified receivers.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">3. How do I receive medicines?</h2>
          <p>As a receiver, you can register, search for available medicines, add them to your cart, and complete the order process.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">4. Is my data safe?</h2>
          <p>Yes, we prioritize user privacy and data security. Please refer to our Privacy Policy for more details.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">5. Who can use MedCycle?</h2>
          <p>MedCycle is designed for verified healthcare entities such as hospitals, pharmacies, and medical shops.</p>
        </div>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
    </div>
  );
}
