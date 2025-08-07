// src/utils/validations.ts

/**
 * Returns an array of error messages, or an empty array if valid.
 */
export function validateEmail(email: string): string[] {
  const errors: string[] = [];
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
}

export function validatePhoneNumber(phoneNumber: string): string[] {
  const errors: string[] = [];
  const phoneRegex = /^\d{10}$/; // Exact 10 digits for US format
  if (!phoneRegex.test(phoneNumber)) {
    errors.push('Phone number must be exactly 10 digits long.');
  }
  return errors;
}

export function validateZipCode(zip: string): string[] {
  const errors: string[] = [];
  const zipRegex = /^\d{5}(-\d{4})?$/; // Matches US ZIP code format
  if (!zipRegex.test(zip)) {
    errors.push('Invalid ZIP code format.');
  }
  return errors;
}

export function validateRequired(value: string | null | undefined): string[] {
  const errors: string[] = [];
  if (value == null || value.trim() === '') {
    errors.push('This field is required.');
  }
  return errors;
}

export function validateCityCountryProfession(value: string): string[] {
  const errors: string[] = [];
  if (!/^[a-zA-Z\s]+$/.test(value)) {
    errors.push('Only alphabetic characters and spaces are allowed.');
  }
  return errors;
}

export function validateText(value: string): string[] {
  const errors: string[] = [];
  if (!/^[a-zA-Z\s]+$/.test(value)) {
    errors.push('Only alphabetic characters and spaces are allowed.');
  }
  return errors;
}

export function validateDOB(dob: string): string[] {
  const errors: string[] = [];
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 8 || age > 120) {
    errors.push('Date of Birth must result in an age between 8 and 120 years.');
  }
  return errors;
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];
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
}

export function isCapsLockOn(event: KeyboardEvent): boolean {
  return event.getModifierState?.('CapsLock') ?? false;
}

export function validatePositiveNumber(value: number): string[] {
  return value >= 0 ? [] : ['Cannot be negative'];
}

/**
 * Wrap Firebase's sendEmailVerification
 */
import { sendEmailVerification as fbSendEmailVerification, User } from 'firebase/auth';
export async function sendVerificationEmail(user: User): Promise<void> {
  try {
    await fbSendEmailVerification(user);
    console.log('Verification email sent.');
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw err;
  }
}

/**
 * Central export for all validators
 */
const validations = {
  validateEmail,
  validatePhoneNumber,
  validateZipCode,
  validateRequired,
  validateCityCountryProfession,
  validateText,
  validateDOB,
  validatePassword,
  isCapsLockOn,
  validatePositiveNumber,
  sendVerificationEmail,
};

export default validations;
