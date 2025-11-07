export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using our website, you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms,
            you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="mb-2">
            Permission is granted to temporarily access the materials on our website for personal,
            non-commercial viewing only. This is the grant of a license, not a transfer of title.
          </p>
          <p className="mb-2">Under this license, you may not:</p>
          <ul className="list-disc pl-6">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to reverse engineer any software on our website</li>
            <li>Remove any copyright or proprietary notations</li>
            <li>Transfer the materials to another person</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Content</h2>
          <p className="mb-2">
            Our website may allow you to post, submit, or otherwise make available content such as
            comments, feedback, or other materials. By posting content, you grant us a non-exclusive,
            worldwide, royalty-free license to use, reproduce, modify, and display such content.
          </p>
          <p className="mb-2">You agree not to post content that:</p>
          <ul className="list-disc pl-6">
            <li>Is illegal, harmful, or offensive</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains viruses or malicious code</li>
            <li>Violates any person's privacy</li>
            <li>Constitutes spam or unauthorized advertising</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Disclaimer</h2>
          <p>
            The materials on our website are provided on an 'as is' basis. We make no warranties,
            expressed or implied, and hereby disclaim all other warranties including, without
            limitation, implied warranties of merchantability, fitness for a particular purpose,
            or non-infringement of intellectual property.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Advertising</h2>
          <p>
            Our website contains third-party advertisements and links to third-party websites.
            We are not responsible for the content, accuracy, or practices of these third parties.
            Your interactions with advertisers are solely between you and the advertiser.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Affiliate Links</h2>
          <p>
            Our website may contain affiliate links. This means we may earn a commission if you
            click on certain links and make a purchase. This comes at no additional cost to you.
            We only recommend products or services we believe will add value to our readers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images, and software,
            is the property of our website or its content suppliers and is protected by copyright
            and intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
          <p>
            In no event shall we or our suppliers be liable for any damages arising out of the
            use or inability to use our website, even if we have been notified of the possibility
            of such damage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Accuracy of Materials</h2>
          <p>
            The materials on our website may include technical, typographical, or photographic errors.
            We do not warrant that any of the materials are accurate, complete, or current. We may
            make changes to the materials at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Links</h2>
          <p>
            We have not reviewed all sites linked to our website and are not responsible for the
            contents of any such linked site. The inclusion of any link does not imply endorsement
            by us. Use of any linked website is at the user's own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Modifications</h2>
          <p>
            We may revise these Terms of Service at any time without notice. By using this website,
            you agree to be bound by the current version of these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with applicable
            laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Termination</h2>
          <p>
            We reserve the right to terminate your access to our website at any time, without notice,
            for conduct that we believe violates these Terms of Service or is harmful to other users,
            us, or third parties, or for any other reason.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
            <br />
            Email: legal@yourdomain.com
          </p>
        </section>
      </div>
    </div>
  )
}
