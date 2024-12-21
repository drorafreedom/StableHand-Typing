
// src/components/pages/PrivacyPolicyPage.tsx

import React from 'react';
import { Frame5, Frame3 } from '../common/Frame';

const PrivacyPolicy: React.FC = () => {
  return (
    <Frame3>
      <Frame5>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="mb-4">
            This Privacy Policy explains how [Your App Name] ("we", "us", "our") collects, uses, and discloses your
            personal data when you use our application or website.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
          <p className="mb-4">We collect the following types of information:</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Personal Information:</strong> This includes your name, email address, phone number, and other data
              that you provide directly to us when you create an account.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect data on how you use the app, such as your browsing activity,
              preferences, and interactions with the app's features.
            </li>
            <li>
              <strong>Cookies:</strong> We use cookies and similar technologies to track your activity on our app and
              hold certain information.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Your Data</h2>
          <p className="mb-4">We use your personal data for the following purposes:</p>
          <ul className="list-disc ml-6">
            <li>To provide and maintain our service, including user authentication and account management.</li>
            <li>To personalize your experience by remembering your preferences and providing tailored content.</li>
            <li>To send you promotional and marketing communications with your consent.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-2">3. Sharing Your Data</h2>
          <p className="mb-4">We do not share your personal information with third parties, except:</p>
          <ul className="list-disc ml-6">
            <li>If required by law or in response to a valid legal request.</li>
            <li>
              With third-party services for analytics, marketing, and hosting our application (e.g., Google Analytics,
              Firebase, etc.).
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-2">4. Data Retention</h2>
          <p className="mb-4">
            We will retain your personal data for as long as necessary to provide the service and fulfill the purposes
            outlined in this policy. You can request the deletion of your data at any time (see Data Deletion section).
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">5. Security of Your Data</h2>
          <p className="mb-4">
            We are committed to securing your personal data and use industry-standard methods to protect it. However, no
            method of transmission over the internet is completely secure.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            policy on this page.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">7. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at [Your Contact Email].
          </p>
        </div>
      </Frame5>
    </Frame3>
  );
};

export default PrivacyPolicy;


//+++++++++++JS version+++++++++++++++++
// src/components/pages/PrivacyPolicyPage.jsx
 // JS version
import React from 'react';
import { Frame5, Frame,Frame3 } from '../common/Frame';
const PrivacyPolicy = () => {
  return ( <Frame3>
    < Frame5>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        This Privacy Policy explains how [Your App Name] ("we", "us", "our") collects, uses, and discloses your personal data when you use our application or website.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        We collect the following types of information:
      </p>
      <ul className="list-disc ml-6">
        <li>Personal Information: This includes your name, email address, phone number, and other data that you provide directly to us when you create an account.</li>
        <li>Usage Data: We collect data on how you use the app, such as your browsing activity, preferences, and interactions with the app's features.</li>
        <li>Cookies: We use cookies and similar technologies to track your activity on our app and hold certain information.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Your Data</h2>
      <p className="mb-4">
        We use your personal data for the following purposes:
      </p>
      <ul className="list-disc ml-6">
        <li>To provide and maintain our service, including user authentication and account management.</li>
        <li>To personalize your experience by remembering your preferences and providing tailored content.</li>
        <li>To send you promotional and marketing communications with your consent.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Sharing Your Data</h2>
      <p className="mb-4">
        We do not share your personal information with third parties, except:
      </p>
      <ul className="list-disc ml-6">
        <li>If required by law or in response to a valid legal request.</li>
        <li>With third-party services for analytics, marketing, and hosting our application (e.g., Google Analytics, Firebase, etc.).</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Data Retention</h2>
      <p className="mb-4">
        We will retain your personal data for as long as necessary to provide the service and fulfill the purposes outlined in this policy. You can request the deletion of your data at any time (see Data Deletion section).
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Security of Your Data</h2>
      <p className="mb-4">
        We are committed to securing your personal data and use industry-standard methods to protect it. However, no method of transmission over the internet is completely secure.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
      <p className="mb-4">
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">7. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, please contact us at [Your Contact Email].
      </p>
    </div>
    </Frame5>
     </Frame3>
  );
};

export default PrivacyPolicy;
