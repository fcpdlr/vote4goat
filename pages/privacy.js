export default function Privacy() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4"><strong>Last Updated:</strong> June 21, 2025</p>

      <p className="mb-4">
        Welcome to Vote4GOAT. We are committed to protecting your privacy and ensuring your personal information is handled responsibly. This Privacy Policy explains how we collect, use, and protect your data in accordance with applicable laws.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-2">When you create an account on Vote4GOAT, we collect the following information:</p>
      <ul className="list-disc list-inside mb-4">
        <li><strong>Email address:</strong> Used for account management and communication.</li>
        <li><strong>Username:</strong> Chosen by the user and shown publicly in the app.</li>
        <li><strong>Date of birth:</strong> Used to verify age and segment user data.</li>
        <li><strong>Country of residence:</strong> Used for regional features and analytics.</li>
        <li><strong>Optional profile photo:</strong> Shown publicly next to your username.</li>
      </ul>

      <p className="mb-4">
        Additionally, we use Google Analytics to collect anonymized, non-personally identifiable information about your interaction with the website (such as pages visited, session length, and general location).
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc list-inside mb-4">
        <li>To create and manage your account.</li>
        <li>To personalize user experience and regional features.</li>
        <li>To display your public profile (username and optional photo).</li>
        <li>To analyze usage trends and improve site performance via Google Analytics.</li>
        <li>To contact you if necessary for account-related issues.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Data Sharing</h2>
      <p className="mb-4">
        We do not sell or share your personal data with third parties except:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li><strong>Google Analytics:</strong> For aggregated analytics with no personal identifiers.</li>
        <li><strong>Legal obligations:</strong> If required by law or to protect our rights or users.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Your Rights</h2>
      <ul className="list-disc list-inside mb-4">
        <li>You can update or delete your account at any time.</li>
        <li>You can contact us at <a className="underline" href="mailto:hello@vote4goat.com">hello@vote4goat.com</a> to request access or deletion of your data.</li>
        <li>You can opt out of communications by unsubscribing from emails.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Data Security</h2>
      <p className="mb-4">
        We take reasonable technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. Children's Privacy</h2>
      <p className="mb-4">
        Vote4GOAT is not intended for children under 16. We do not knowingly collect data from minors. If we discover such data, we will delete it immediately.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">7. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. The latest version will always be available on this page.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">8. Contact</h2>
      <p className="mb-4">
        For any questions or concerns about your data, please email us at <a className="underline" href="mailto:hello@vote4goat.com">hello@vote4goat.com</a>.
      </p>
    </main>
  );
}
