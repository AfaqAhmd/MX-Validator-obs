import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | MX Validator',
  description: 'Privacy policy for the MX Validator lead verification tool.',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12 text-white/90">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Privacy Policy</h1>
      <p className="text-sm text-white/60 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-6 text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Overview</h2>
          <p>
            MX Validator is a tool provided by OutreachBoosters to help you validate email
            domains and improve the deliverability of your outreach. This Privacy Policy
            explains what information we collect, how we use it, and the choices you have.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <p className="mb-2">When you request access to MX Validator, we collect:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="font-medium">Name</span> – so we can personalize communication
              and reporting.
            </li>
            <li>
              <span className="font-medium">Company name</span> – to understand which business
              is using the tool and to tailor recommendations.
            </li>
            <li>
              <span className="font-medium">Email address</span> – used to verify your account
              and, if you opt in, to send product-related communication.
            </li>
            <li>
              <span className="font-medium">Technical data</span> – such as IP address, browser
              type, and usage logs, collected automatically for security and analytics.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
          <p className="mb-2">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verify your email address and secure access to MX Validator.</li>
            <li>Provide, maintain, and improve the MX validation experience.</li>
            <li>Generate anonymized statistics about tool usage and performance.</li>
            <li>
              Communicate important updates about the tool, deliverability tips, or changes to
              this policy.
            </li>
          </ul>
          <p className="mt-2">
            We do <span className="font-semibold">not</span> sell your personal information or
            your lead lists to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Email & Lead Data</h2>
          <p>
            When you upload CSV files to MX Validator, we process the email addresses and
            domains solely for the purpose of checking MX records and providing deliverability
            insights. We do not contact your leads or use those addresses for our own
            marketing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Service Providers</h2>
          <p className="mb-2">
            We may use third-party services to host the application and send transactional
            emails (for example, Resend, Vercel, Neon/Postgres). These providers process data
            on our behalf and are contractually obligated to protect it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
          <p>
            We retain your account and usage data only as long as necessary to operate the tool
            and comply with legal obligations. You can request deletion of your access data and
            associated information at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
          <p className="mb-2">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request corrections to inaccurate or incomplete data.</li>
            <li>Request deletion of your data, subject to legal exceptions.</li>
            <li>Object to certain types of processing or withdraw consent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect your data,
            including encrypted connections (HTTPS) and secure database access. However, no
            method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update
            the “Last updated” date at the top of this page. Significant changes may be
            communicated via email or in-app notifications.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or how your data is handled,
            you can contact us at{' '}
            <a
              href="mailto:privacy@outreachboosters.io"
              className="text-primary underline hover:text-primary/80"
            >
              privacy@outreachboosters.io
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

