
// src/components/pages/TermsOfServicePage.tsx

import React from 'react';
import { Frame5, Frame, Frame3 } from '../common/Frame';

const TermsOfServicePage: React.FC = () => {
  return (
    <Frame3>
      <Frame5>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="mb-4">
            Welcome to our application. By accessing or using our services, you agree to be bound by the following terms and
            conditions. Please read them carefully.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By using our application, you agree to comply with and be legally bound by the terms and conditions of these Terms
            of Service ("Terms"). These Terms apply to all visitors, users, and others who access or use the service.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">2. Modifications</h2>
          <p className="mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
            material, we will notify you by email or via a notice on our service prior to the changes taking effect. What
            constitutes a material change will be determined at our sole discretion.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">3. User Responsibilities</h2>
          <p className="mb-4">
            You are responsible for safeguarding the password that you use to access the service and for any activities or
            actions under your password. You agree not to disclose your password to any third party. You must notify us
            immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">4. Prohibited Activities</h2>
          <p className="mb-4">You agree not to engage in any of the following prohibited activities:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Copying, distributing, or disclosing any part of the service in any medium.</li>
            <li>
              Using any automated system, including but not limited to "robots," "spiders," or "offline readers" to access the
              service.
            </li>
            <li>Transmitting spam, chain letters, or other unsolicited email.</li>
            <li>Attempting to interfere with the servers or networks connected to the service.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-6 mb-2">5. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason
            whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature
            should survive termination shall survive termination, including, without limitation, ownership provisions, warranty
            disclaimers, indemnity, and limitations of liability.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">6. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall our company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable
            for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of
            profits, data, use, goodwill, or other intangible losses, resulting from (i) your use or inability to use the
            service; (ii) any unauthorized access to or use of our servers and/or any personal information stored therein.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">7. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed and construed in accordance with the laws of the country in which we operate, without
            regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at <strong>support@yourapp.com</strong>.
          </p>
        </div>
      </Frame5>
    </Frame3>
  );
};

export default TermsOfServicePage;


//+++++++++++JS version+++++++++++++++++
// src/components/pages/TermsOfServicePage.jsx
 // JS version
/* import React from 'react';
import { Frame5, Frame,Frame3 } from '../common/Frame';
 

const TermsOfServicePage = () => {
 
    return ( <Frame3>
    < Frame5>
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">
        Welcome to our application. By accessing or using our services, you agree to be bound by the following terms and conditions. Please read them carefully.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-2">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By using our application, you agree to comply with and be legally bound by the terms and conditions of these Terms of Service ("Terms"). These Terms apply to all visitors, users, and others who access or use the service.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-2">2. Modifications</h2>
      <p className="mb-4">
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will notify you by email or via a notice on our service prior to the changes taking effect. What constitutes a material change will be determined at our sole discretion.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-2">3. User Responsibilities</h2>
      <p className="mb-4">
        You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-2">4. Prohibited Activities</h2>
      <p className="mb-4">
        You agree not to engage in any of the following prohibited activities:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Copying, distributing, or disclosing any part of the service in any medium.</li>
        <li>Using any automated system, including but not limited to "robots," "spiders," or "offline readers" to access the service.</li>
        <li>Transmitting spam, chain letters, or other unsolicited email.</li>
        <li>Attempting to interfere with the servers or networks connected to the service.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-6 mb-2">5. Termination</h2>
      <p className="mb-4">
        We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-2">6. Limitation of Liability</h2>
      <p className="mb-4">
        In no event shall our company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your use or inability to use the service; (ii) any unauthorized access to or use of our servers and/or any personal information stored therein.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-2">7. Governing Law</h2>
      <p className="mb-4">
        These Terms shall be governed and construed in accordance with the laws of the country in which we operate, without regard to its conflict of law provisions.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-2">8. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about these Terms, please contact us at <strong>support@yourapp.com</strong>.
      </p>
    </div>
    </Frame5>
    </Frame3>
  );
};

export default TermsOfServicePage; */
