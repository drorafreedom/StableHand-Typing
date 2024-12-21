
// src/components/pages/SetNewPasswordPage.tsx

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SetNewPasswordPage: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSetNewPassword = async (e: FormEvent) => {
    e.preventDefault();
    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setMessage('Invalid or missing password reset code.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage('Password has been reset successfully.');
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after success
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Set New Password</h1>
      <form className="space-y-4" onSubmit={handleSetNewPassword}>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Confirm new password"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Set New Password
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
    </div>
  );
};

export default SetNewPasswordPage;


//+++++++++++JS version+++++++++++++++++
// src/components/pages/SetNewPasswordPage.jsx
 // JS version
/* import React, { useState } from 'react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SetNewPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    const oobCode = searchParams.get('oobCode');
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage('Password has been reset successfully.');
      navigate('/login');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Set New Password</h1>
      <form className="space-y-4" onSubmit={handleSetNewPassword}>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Confirm new password"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Set New Password
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
    </div>
  );
};

export default SetNewPasswordPage;
 */