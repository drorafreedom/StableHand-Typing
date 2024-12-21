
// src/components/pages/DataDeletionInstructionsPage.tsx

import React from 'react';
import { Frame5, Frame, Frame3 } from '../common/Frame';

const DataDeletionInstructions: React.FC = () => {
  return (
    <Frame3>
      <Frame5>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Data Deletion Policy</h1>
          <p className="mb-4">
            This Data Deletion Policy outlines how you can request the deletion of your personal data from [Your App Name] ("we", "us", "our").
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">1. Right to Request Data Deletion</h2>
          <p className="mb-4">
            You have the right to request the deletion of your personal data at any time. This includes any information that you have provided to us during registration, profile updates, or any other interaction with our service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">2. How to Request Data Deletion</h2>
          <p className="mb-4">
            To request the deletion of your personal data, please contact us via email at [Your Contact Email] with the subject line "Data Deletion Request". In your email, include:
          </p>
          <ul className="list-disc ml-6">
            <li>Your full name</li>
            <li>Your email address associated with the account</li>
            <li>Any other relevant information that will help us locate your data</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-2">3. Processing Your Request</h2>
          <p className="mb-4">
            Once we receive your data deletion request, we will take the necessary steps to delete your personal data from our systems within 30 days. You will receive a confirmation email once your data has been deleted.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">4. Exceptions</h2>
          <p className="mb-4">
            In some cases, we may be required to retain certain information for legal, security, or operational reasons. For example, we may need to retain data to comply with financial regulations or to resolve disputes.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">5. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Data Deletion Policy or need assistance with your request, please contact us at [Your Contact Email].
          </p>
        </div>
      </Frame5>
    </Frame3>
  );
};

export default DataDeletionInstructions;

//+++++++++++JS version+++++++++++++++++
// src/components/pages/DataDeletionInstructionsPage.jsx
 // JS version
import React from 'react';
import { Frame5, Frame,Frame3 } from '../common/Frame';
const DataDeletionInstructions = () => {
  return (
    <Frame3> 
      <Frame5>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Data Deletion Policy</h1>
      <p className="mb-4">
        This Data Deletion Policy outlines how you can request the deletion of your personal data from [Your App Name] ("we", "us", "our").
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Right to Request Data Deletion</h2>
      <p className="mb-4">
        You have the right to request the deletion of your personal data at any time. This includes any information that you have provided to us during registration, profile updates, or any other interaction with our service.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. How to Request Data Deletion</h2>
      <p className="mb-4">
        To request the deletion of your personal data, please contact us via email at [Your Contact Email] with the subject line "Data Deletion Request". In your email, include:
      </p>
      <ul className="list-disc ml-6">
        <li>Your full name</li>
        <li>Your email address associated with the account</li>
        <li>Any other relevant information that will help us locate your data</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Processing Your Request</h2>
      <p className="mb-4">
        Once we receive your data deletion request, we will take the necessary steps to delete your personal data from our systems within 30 days. You will receive a confirmation email once your data has been deleted.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Exceptions</h2>
      <p className="mb-4">
        In some cases, we may be required to retain certain information for legal, security, or operational reasons. For example, we may need to retain data to comply with financial regulations or to resolve disputes.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this Data Deletion Policy or need assistance with your request, please contact us at [Your Contact Email].
      </p>
    </div>
    </Frame5>
    </Frame3>
  );
};

export default DataDeletionInstructions;
