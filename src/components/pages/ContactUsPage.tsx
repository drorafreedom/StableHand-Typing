// src/pages/ContactUs.tsx
import { useState } from 'react';
import { db, auth } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  sendCopy: boolean;
  // spam honeypot (hidden input)
  company?: string;
}

const ContactUs = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    sendCopy: true,
    company: '',
  });
  const [status, setStatus] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('');
    setSubmitting(true);

    try {
      // Very light spam check: if hidden "company" is filled, ignore
      if (formData.company && formData.company.trim().length > 0) {
        setStatus('Thanks!'); // do not reveal honeypot
        setSubmitting(false);
        return;
      }

      const user = auth.currentUser;

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        sendCopy: !!formData.sendCopy,
        userId: user ? user.uid : 'anonymous',
        timestamp: serverTimestamp(),
        source: 'contact_form',
      };

      // Store in general collection (Cloud Function will send the email)
      await addDoc(collection(db, 'messages'), payload);

      // Optional: store under the user for history if logged in
      if (user) {
        await addDoc(collection(db, `users/${user.uid}/messages`), {
          ...payload,
        });
      }

      setStatus('Message sent! We’ll get back to you shortly.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        sendCopy: true,
        company: '',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('Error sending message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="text-3xl font-semibold text-center mb-6">Contact Us</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Questions about Stable Hand? Send us a note and we’ll reply by email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot (hidden) */}
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div>
            <label className="block mb-1 font-medium" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="How can we help?"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={5}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="sendCopy"
              name="sendCopy"
              type="checkbox"
              checked={formData.sendCopy}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="sendCopy" className="text-sm text-gray-700">
              Email me a copy
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-700">{status}</p>
        )}

        <p className="mt-6 text-xs text-gray-400 text-center">
          This form saves a record in our database and sends an email to the team.
        </p>
      </div>
    </div>
  );
};

export default ContactUs;



/*  

// src/pages/ContactUs.tsx
//simple version send the msg as file on storage 
import { useState } from 'react';
import { db, auth } from '../../firebase/firebase'; // Import Firestore and Auth
import { collection, addDoc } from 'firebase/firestore'; // Firestore methods

interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactUs = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const user = auth.currentUser; // Get the logged-in user

      // Store message in the general 'messages' collection
      await addDoc(collection(db, 'messages'), {
        ...formData,
        userId: user ? user.uid : 'anonymous',
        timestamp: new Date(),
      });

      // If user is logged in, also store the message under their user ID
      if (user) {
        const userMessagesRef = collection(db, `users/${user.uid}/messages`);
        await addDoc(userMessagesRef, {
          ...formData,
          timestamp: new Date(),
        });
      }

      setStatus('Message sent! We will get back to you shortly.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('Error sending message. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={4}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send Message
          </button>
        </form>
        {status && <p className="mt-4 text-center">{status}</p>}
      </div>
    </div>
  );
};

export default ContactUs; */


//+++++++++++JS version+++++++++++++++++
// src/pages/ContactUs.jsx
 // JS version
/* import { useState } from 'react';
import { db, auth } from '../../firebase/firebase'; // Import Firestore and Auth
import { collection, addDoc, doc } from 'firebase/firestore'; // Firestore methods

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const user = auth.currentUser; // Get the logged-in user

      // Store message in the general 'messages' collection
      await addDoc(collection(db, 'messages'), {
        ...formData,
        userId: user ? user.uid : 'anonymous',
        timestamp: new Date(),
      });

      // If user is logged in, also store the message under their user ID
      if (user) {
        const userMessagesRef = collection(db, `users/${user.uid}/messages`);
        await addDoc(userMessagesRef, {
          ...formData,
          timestamp: new Date(),
        });
      }

      setStatus('Message sent! We will get back to you shortly.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('Error sending message. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="4"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send Message
          </button>
        </form>
        {status && <p className="mt-4 text-center">{status}</p>}
      </div>
    </div>
  );
};

export default ContactUs;
 */
//000000000000000000000000000000000000000000000
/* import React from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame, Frame3 } from '../common/Frame';

const ContactUsPage = () => {
  return (
    <Frame3 >
    <div className="flex flex-col items-center justify-top min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-gray-200 p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold mb-4">Contact Us </h1>
        <p className="text-lg mb-6">Coming Soon</p>
        <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
      </div>
    </div>
    </Frame3>  
  );
};

export default ContactUsPage; */

/* import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { app } from '../../firebase/firebase'; // Ensure Firebase is initialized

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: [],
    email: [],
    subject: [],
    message: []
  });
  const [submissionMessage, setSubmissionMessage] = useState({ message: '', type: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: [] });
  };

  const validateForm = () => {
    const errors = { name: [], email: [], subject: [], message: [] };
    let isValid = true;

    if (formData.name.trim() === '') {
      errors.name.push('Name is required.');
      isValid = false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email.push('Email is invalid.');
      isValid = false;
    }
    if (formData.subject.trim() === '') {
      errors.subject.push('Subject is required.');
      isValid = false;
    }
    if (formData.message.trim() === '') {
      errors.message.push('Message is required.');
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage({ message: '', type: '' });

    if (validateForm()) {
      const functions = getFunctions(app);
      const sendContactEmail = httpsCallable(functions, 'sendContactEmail');
      try {
        const result = await sendContactEmail(formData);
        if (result.data.success) {
          setSubmissionMessage({ message: 'Message sent successfully!', type: 'success' });
          setFormData({ name: '', email: '', subject: '', message: '' });
        } else {
          setSubmissionMessage({ message: `Error: ${result.data.error}`, type: 'error' });
        }
      } catch (error) {
        setSubmissionMessage({ message: `Error: ${error.message}`, type: 'error' });
      }
    } else {
      setSubmissionMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            errors={formErrors.name}
            placeholder="Enter your name"
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            errors={formErrors.email}
            placeholder="Enter your email"
          />
          <InputField
            label="Subject"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            errors={formErrors.subject}
            placeholder="Enter the subject"
          />
          <InputField
            label="Message"
            type="textarea"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            errors={formErrors.message}
            placeholder="Enter your message"
          />
          {submissionMessage.message && <Alert message={submissionMessage.message} type={submissionMessage.type} />}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Send Message</Button>
        </form>
      </div>
    </div>
  );
};

export default ContactUsPage;
 */
 