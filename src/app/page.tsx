import Link from 'next/link';

// ---------- Constants ----------
const PROCESS_STEPS = [
  { number: 1, title: 'Create wishlist' },
  { number: 2, title: 'Add gifts' },
  { number: 3, title: 'Share public link' },
  { number: 4, title: 'Friends reserve or contribute' },
  { number: 5, title: 'Realtime updates' },
] as const;

const OWNER_FEATURES = [
  'Create a wishlist in seconds',
  'Add gifts with details and price',
  'Get a shareable public link',
] as const;

const GUEST_FEATURES = [
  'Open the public link – no login needed',
  'Reserve a gift so nobody duplicates',
  'Contribute money towards expensive gifts',
] as const;

const PRIVACY_RULES = [
  { icon: '🔒', text: 'Owner never sees who reserved' },
  { icon: '💰', text: 'Contributions are anonymous' },
  { icon: '🌐', text: 'Public wishlist works without login' },
] as const;

// ---------- Internal Components ----------
function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start">
      <svg
        className="h-6 w-6 text-indigo-500 mr-3 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span className="text-gray-700">{text}</span>
    </li>
  );
}

function StepCard({ number, title }: { number: number; title: string }) {
  return (
    <div className="relative">
      <div
        className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-lg font-bold mx-auto"
        aria-label={`Step ${number}`}
      >
        {number}
      </div>
      <p className="mt-4 text-center text-gray-600">{title}</p>
    </div>
  );
}

// ---------- Main Page ----------
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero section */}
        <header className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Social Wishlist
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            The simplest way to share gift ideas with friends and family. No
            sign‑up required for guests.
          </p>
        </header>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/wishlist/create"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Create a new wishlist"
          >
            Create Wishlist
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Sign in to your account"
          >
            Sign In
          </Link>
          <Link
            href="/w/7b8047dc"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="View a demo wishlist"
          >
            Open Demo Wishlist
          </Link>
        </div>

        {/* How it works */}
        <section className="mt-24" aria-labelledby="process-heading">
          <h2
            id="process-heading"
            className="text-3xl font-bold text-center text-gray-900"
          >
            How it works
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS_STEPS.map((step) => (
              <StepCard
                key={step.number}
                number={step.number}
                title={step.title}
              />
            ))}
          </div>
        </section>

        {/* Owner / Guest cards */}
        <section className="mt-24" aria-labelledby="roles-heading">
          <h2 id="roles-heading" className="sr-only">
            Features for owners and guests
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Owner card */}
            <article className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900">
                For owners
              </h3>
              <ul className="mt-6 space-y-4">
                {OWNER_FEATURES.map((feature) => (
                  <FeatureItem key={feature} text={feature} />
                ))}
              </ul>
            </article>

            {/* Guest card */}
            <article className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900">
                For guests
              </h3>
              <ul className="mt-6 space-y-4">
                {GUEST_FEATURES.map((feature) => (
                  <FeatureItem key={feature} text={feature} />
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* Product rules */}
        <section
          className="mt-24 bg-indigo-50 rounded-2xl p-8 border border-indigo-100"
          aria-labelledby="privacy-heading"
        >
          <h2
            id="privacy-heading"
            className="text-2xl font-semibold text-indigo-900 text-center"
          >
            Privacy by design
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            {PRIVACY_RULES.map((rule) => (
              <div key={rule.text} className="text-center">
                <div className="text-4xl mb-2" aria-hidden="true">
                  {rule.icon}
                </div>
                <p className="text-indigo-800">{rule.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer / secondary CTA */}
        <footer className="mt-24 text-center">
          <p className="text-gray-600 mb-4">
            Ready to create your wishlist?
          </p>
          <Link
            href="/wishlist/create"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Create your first wishlist for free"
          >
            Get started – it&apos;s free
          </Link>
        </footer>
      </div>
    </main>
  );
}