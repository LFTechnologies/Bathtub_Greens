export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you about how we look after your personal data
            when you visit our website and tell you about your privacy rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-2">We may collect, use, store and transfer different kinds of personal data about you:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Identity Data:</strong> Username, email address</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, links clicked</li>
            <li><strong>Marketing Data:</strong> Newsletter preferences, communication preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-2">We use your data to:</p>
          <ul className="list-disc pl-6">
            <li>Provide and maintain our service</li>
            <li>Notify you about changes to our service</li>
            <li>Provide customer support</li>
            <li>Monitor usage and improve our service</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Personalize your experience</li>
            <li>Show relevant advertisements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
          <p className="mb-2">
            We use cookies and similar tracking technologies to track activity on our service.
            Cookies are files with small amounts of data that are stored on your device.
          </p>
          <p className="mb-2">We use the following types of cookies:</p>
          <ul className="list-disc pl-6">
            <li><strong>Necessary Cookies:</strong> Essential for the website to function</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
            <li><strong>Advertising Cookies:</strong> Used to show relevant ads</li>
            <li><strong>Preference Cookies:</strong> Remember your preferences and settings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p className="mb-2">We use the following third-party services that may collect your data:</p>
          <ul className="list-disc pl-6">
            <li><strong>Google AdSense:</strong> For displaying advertisements</li>
            <li><strong>Google Analytics:</strong> For website analytics</li>
            <li><strong>Social Media Platforms:</strong> For sharing and embedding content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p>
            We have implemented appropriate security measures to prevent your personal data from
            being accidentally lost, used, accessed, altered, or disclosed. We limit access to
            your personal data to those who have a genuine business need to access it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-6">
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
            <li>Request transfer of your personal data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p>
            We will only retain your personal data for as long as necessary to fulfill the
            purposes we collected it for, including for legal or reporting requirements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p>
            Our service is not directed to children under 13. We do not knowingly collect
            personal information from children under 13. If you are a parent and believe
            your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the "last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: privacy@yourdomain.com
          </p>
        </section>
      </div>
    </div>
  )
}
