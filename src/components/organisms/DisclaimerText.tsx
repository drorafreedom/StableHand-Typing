// src/components/organisms/DisclaimerText.tsx
// TS version

import React from 'react';

const DisclaimerText: React.FC = () => {
  return (
    <div className="text-justify">
      <h2 className="text-2xl font-bold mb-4">Clinical Trial Disclaimer and Acknowledgment of Risk</h2>
      <p>
        Welcome to our clinical trial aimed at stabilizing Parkinson's disease and other tremor disorders through
        innovative visual therapy. Our approach involves altering background textures and movements to potentially
        reduce tremor severity. This therapeutic intervention is designed to be engaging and enjoyable for participants,
        resembling a game-like experience.
      </p>
      <h3 className="text-xl font-semibold mt-4">Purpose and Scope</h3>
      <p>
        The purpose of this clinical trial is to evaluate the effectiveness of visual therapy in stabilizing tremors in
        individuals with Parkinson's disease and other tremor disorders. Participants will be exposed to various visual
        stimuli that may help reduce the severity of their tremors.
      </p>
      <h3 className="text-xl font-semibold mt-4">Potential Risks and Discomforts</h3>
      <p>While the therapy is designed to be safe and enjoyable, there are potential risks and discomforts that participants should be aware of:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Exposure to visual stimuli may trigger migraines in susceptible individuals.</li>
        <li>Participants with a history of epilepsy or other seizure disorders may be at risk of experiencing seizures due to visual stimuli.</li>
        <li>Other unforeseen risks associated with visual therapy and exposure to dynamic background textures.</li>
      </ul>
      <p>Participants are encouraged to report any discomfort or adverse reactions to the study staff immediately.</p>
      <h3 className="text-xl font-semibold mt-4">Confidentiality and Privacy</h3>
      <p>
        We are committed to protecting the privacy and confidentiality of all participants. All data collected during
        this study will be stored securely and only accessible to authorized personnel. Personal information will not be
        shared with any third parties without your explicit consent, except as required by law. This study is compliant
        with the Health Insurance Portability and Accountability Act (HIPAA) regulations to ensure the confidentiality
        and security of your health information.
      </p>
      <h3 className="text-xl font-semibold mt-4">Voluntary Participation</h3>
      <p>
        Your participation in this clinical trial is entirely voluntary. You may withdraw from the study at any time
        without any penalty or loss of benefits to which you are otherwise entitled. If you decide to withdraw, please
        inform the study staff immediately.
      </p>
      <h3 className="text-xl font-semibold mt-4">Acknowledgment of Understanding and Consent</h3>
      <p>
        By signing this form, you acknowledge that you have read and understood the information provided above,
        including the potential risks and discomforts associated with participating in this study. You agree to
        participate in this clinical trial and consent to the collection and use of your data as described.
      </p>
      <p>
        If you have any questions or concerns about this study or your rights as a participant, please contact the study
        staff at [Contact Information].
      </p>
    </div>
  );
};

export default DisclaimerText;



//+++++++++++JS VERSIOn++++++++++++++++++
// src/components/organisms/DisclaimerText.jsx
//JS version
import React from 'react';

const DisclaimerText = () => {
  return (
    <div className="text-justify">
      <h2 className="text-2xl font-bold mb-4">Clinical Trial Disclaimer and Acknowledgment of Risk</h2>
      <p>
        Welcome to our clinical trial aimed at stabilizing Parkinson's disease and other tremor disorders through innovative visual therapy. Our approach involves altering background textures and movements to potentially reduce tremor severity. This therapeutic intervention is designed to be engaging and enjoyable for participants, resembling a game-like experience.
      </p>
      <h3 className="text-xl font-semibold mt-4">Purpose and Scope</h3>
      <p>
        The purpose of this clinical trial is to evaluate the effectiveness of visual therapy in stabilizing tremors in individuals with Parkinson's disease and other tremor disorders. Participants will be exposed to various visual stimuli that may help reduce the severity of their tremors.
      </p>
      <h3 className="text-xl font-semibold mt-4">Potential Risks and Discomforts</h3>
      <p>
        While the therapy is designed to be safe and enjoyable, there are potential risks and discomforts that participants should be aware of:
      </p>
      <ul className="list-disc list-inside ml-4">
        <li>Exposure to visual stimuli may trigger migraines in susceptible individuals.</li>
        <li>Participants with a history of epilepsy or other seizure disorders may be at risk of experiencing seizures due to visual stimuli.</li>
        <li>Other unforeseen risks associated with visual therapy and exposure to dynamic background textures.</li>
      </ul>
      <p>
        Participants are encouraged to report any discomfort or adverse reactions to the study staff immediately.
      </p>
      <h3 className="text-xl font-semibold mt-4">Confidentiality and Privacy</h3>
      <p>
        We are committed to protecting the privacy and confidentiality of all participants. All data collected during this study will be stored securely and only accessible to authorized personnel. Personal information will not be shared with any third parties without your explicit consent, except as required by law. This study is compliant with the Health Insurance Portability and Accountability Act (HIPAA) regulations to ensure the confidentiality and security of your health information.
      </p>
      <h3 className="text-xl font-semibold mt-4">Voluntary Participation</h3>
      <p>
        Your participation in this clinical trial is entirely voluntary. You may withdraw from the study at any time without any penalty or loss of benefits to which you are otherwise entitled. If you decide to withdraw, please inform the study staff immediately.
      </p>
      <h3 className="text-xl font-semibold mt-4">Acknowledgment of Understanding and Consent</h3>
      <p>
        By signing this form, you acknowledge that you have read and understood the information provided above, including the potential risks and discomforts associated with participating in this study. You agree to participate in this clinical trial and consent to the collection and use of your data as described.
      </p>
      <p>
        If you have any questions or concerns about this study or your rights as a participant, please contact the study staff at [Contact Information].
      </p>

      
    </div>
  );
};

export default DisclaimerText;
