// src/components/pages/RegistrationPage.jsx

import React, { useState } from 'react';
import RegistrationForm from '../RegistrationForm';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { sendVerificationEmail } from '../../../utils/validation';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleRegister = async (email, password, phoneNumber) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendVerificationEmail(userCredential.user);
export const validateEmail = (email) => {
  const errors = [];
  if (!email.includes('@')) {
    errors.push('Email must contain @');
  }
  if (!email.includes('.')) {
    errors.push('Email must contain a domain, e.g., ".com"');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Invalid email format');
  }
  return errors;
};

// Validate password rules
export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  return errors;
};

// Check if Caps Lock is on
export const isCapsLockOn = (event) => {
  return event.getModifierState && event.getModifierState('CapsLock');
};

// Send email verification
export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    console.log('Verification email sent.');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};
