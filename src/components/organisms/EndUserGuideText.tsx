// src/components/organisms/EndUserGuideText.tsx
import React from 'react';

const EndUserGuideText: React.FC = () => (
  <div className="max-w-3xl mx-auto bg-teal-100 p-6 rounded-lg shadow-md border border-gray-300">
      <h1 className="text-4xl font-bold text-center mb-6">StableHand Typing Clinical Trial – End‑User Guide</h1>
   

    <p>
      Welcome to StableHand’s Clinical Trial Dashboard! This step‑by‑step guide will walk you through everything you need to know—from creating your account and logging in, to completing each module (Disclaimer, Background, Demographics, Interviews, Therapy, Progress Notes).
    </p>

    <h2>1. Create Your Account &amp; Verify Email</h2>
    <ol>
      <li>
        <strong>Visit:</strong> <a href="https://stablehand-typing.web.app" target="_blank" rel="noopener noreferrer">https://stablehand-typing.web.app</a>
      </li>
      <li>
        <strong>Click “Register”</strong> and fill in:
        <ul>
          <li>Email, Password, Confirm Password</li>
          <li>
            (Optional) Check “Enable phone as 2nd factor” and enter your mobile number to enroll SMS‑based 2FA
          </li>
        </ul>
      </li>
      <li>Submit → You’ll see “Verification email sent.”</li>
      <li>Open your email and click the link to verify your address.</li>
      <li>
        If you enabled phone 2FA, you’ll then be prompted to send and enter an SMS code before you can finish registration.
      </li>
    </ol>

    <h2>2. Log In</h2>
    <ol>
      <li>
        <strong>Email/Password:</strong> enter your credentials, then click Login.
      </li>
      <li>
        <strong>Third‑Party:</strong> choose “Login with Google,” “Facebook,” etc., then follow the popup.
      </li>
      <li>
        <strong>Forgot password?</strong> Click Reset Password, type your email, then check your inbox for the reset link.
      </li>
    </ol>

    <h2>3. Welcome Page &amp; Navigation</h2>
    <p>
      Once logged in, you’ll land on the Welcome page. You’ll see tiles for each section:
    </p>
    <table className="table-auto border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 px-2 py-1">Section</th>
          <th className="border border-gray-300 px-2 py-1">Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-300 px-2 py-1">Disclaimer</td>
          <td className="border border-gray-300 px-2 py-1">Read &amp; accept the study’s terms before proceeding.</td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-2 py-1">Background</td>
          <td className="border border-gray-300 px-2 py-1">Answer general background questions (education, work).</td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-2 py-1">Demographics</td>
          <td className="border border-gray-300 px-2 py-1">Enter personal details (age, gender, etc.).</td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-2 py-1">Medical Interview</td>
          <td className="border border-gray-300 px-2 py-1">Share your medical history and current health info.</td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-2 py-1">Parkinson Interview (PDQ‑39)</td>
          <td className="border border-gray-300 px-2 py-1">Complete the standard PDQ‑39 questionnaire.</td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-2 py-1">Therapy</td>
          <td className="border border-gray-300 px-2 py-1">Perform typing tasks on different backgrounds.</td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-2 py-1">Progress Notes</td>
          <td className="border border-gray-300 px-2 py-1">Add notes about your performance and observations.</td>
        </tr>
      </tbody>
    </table>

    <h2>4. Completing the Disclaimer</h2>
    <ol>
      <li>Read the study consent text carefully.</li>
      <li>Click the “I Agree” button at the bottom.</li>
      <li>You’ll be automatically returned to the Welcome page.</li>
    </ol>

    <h2>5. Background &amp; Demographics</h2>
    <p>
      <strong>Background:</strong> fill out fields like “Highest Education,” “Profession,” etc.
    </p>
    <p>
      <strong>Demographics:</strong> enter your name, date of birth, gender, ethnicity, income bracket, etc.
    </p>
    <p>All fields marked with a “*” are required. Inline error messages will appear if you leave something blank or mistype.</p>

    <h2>6. Medical &amp; Parkinson Interviews</h2>
    <ol>
      <li>Medical Interview: answer questions about past illnesses, medications, allergies, and family history.</li>
      <li>
        Parkinson Interview (PDQ‑39): rate how Parkinson’s affects you over the last month (mobility, daily activities, emotions).
      </li>
      <li>Use the Next / Back buttons at the bottom to navigate between pages.</li>
    </ol>

    <h2>7. Therapy (Typing Tasks)</h2>
    <ol>
      <li><strong>Select a Background</strong>—use the dropdown or color picker on the left.</li>
      <li><strong>Start Typing</strong>—a text passage appears; re‑type it as accurately and quickly as you can.</li>
      <li><strong>Submit</strong>—click Submit when finished; your typing speed, accuracy, and keystrokes are recorded.</li>
      <li>
        Feel free to switch backgrounds between passages to see which yields your best performance.
      </li>
    </ol>

    <h2>8. Progress Notes</h2>
    <p>
      After your typing tasks, jot down any observations in Progress Notes—for example, how you felt, any fatigue or discomfort, or environmental distractions.
    </p>

    <h2>9. Logging Out</h2>
    <ol>
      <li>Click your profile icon (top right).</li>
      <li>Choose “Sign Out.”</li>
      <li>You can log back in anytime; you’ll return to where you left off.</li>
    </ol>

    <h2>Tips &amp; Troubleshooting</h2>
    <ul>
      <li><strong>Email not arriving?</strong> Check your Spam folder or click “Resend verification” on the Registration page.</li>
      <li><strong>SMS code delayed?</strong> Wait a minute, then click Resend SMS.</li>
      <li><strong>Form won’t submit?</strong> Look for red inline error messages identifying the problem.</li>
      <li><strong>Need help?</strong> Use the “Help” link in the footer or open a GitHub Issue in the <a href="https://github.com/drorafreedom/StableHand-Typing" target="_blank" rel="noopener noreferrer">repo</a>.</li>
   {/* <li><strong>Need help?</strong> Use the “Help” link in the footer or open a GitHub Issue in the <a href="https://github.com/drorafreedom/StableHand-Typing" target="_blank" rel="noopener noreferrer">repo</a>.</li> */}
    </ul>
  </div>
);

export default EndUserGuideText;
