// src/components/pages/FeedbackAndProgressPage.tsx

// src/components/pages/FeedbackAndProgressPage.tsx (data‑driven, mirrors MedicalInterviewPage style)
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../data/AuthContext';
import { db, storage } from '../../firebase/firebase';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import TextAreaField from '../common/TextAreaField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import DateTimeDisplay from '../common/DateTimeDisplay';
import { Frame3 } from '../common/Frame';
import { ref, uploadString } from 'firebase/storage';
import { progressFeedbackFields } from '../../data/progressFeedbackFields';
import {
  validateRequired,
  validateEmail,
} from '../../utils/validation';

interface FormData {
  [key: string]: string | string[] | number;
}

interface ErrorData {
  [key: string]: string[];
}

const FeedbackAndProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<ErrorData>({});
  const [globalMessage, setGlobalMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const field = progressFeedbackFields.find((f) => f.name === name);
    if (field && field.validate) {
      const validationErrors = field.validate.map((validate) => validate(value, formData)).flat();
      setErrors((prev) => ({ ...prev, [name]: validationErrors }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
    setGlobalMessage(null);
  };

  const handleMultiSelectChange = (selectedValues: string[], name: string): void => {
    setFormData((prev) => ({ ...prev, [name]: selectedValues }));

    const field = progressFeedbackFields.find((f) => f.name === name);
    if (field && field.validate) {
      const validationErrors = field.validate.map((validate) => validate(selectedValues, formData)).flat();
      setErrors((prev) => ({ ...prev, [name]: validationErrors }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
    setGlobalMessage(null);
  };

  const validateAllFields = (): boolean => {
    const newErrors: ErrorData = {};
    let hasErrors = false;

    progressFeedbackFields.forEach((field) => {
      const value = formData[field.name];
      if (field.validate) {
        const validationErrors = field.validate.map((validate) => validate(value, formData)).flat();
        if (validationErrors.length > 0) {
          newErrors[field.name] = validationErrors;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateAllFields()) {
      setGlobalMessage({ message: 'Please fill all required fields.', type: 'error' });
      return;
    }

    try {
      const timestamp = new Date();
      const localDateTime = timestamp.toLocaleString();
      const formDataWithTimestamp = {
        ...formData,
        userId: currentUser?.uid || 'anonymous',
        timestamp: timestamp.toISOString(),
        localDateTime,
      };

      // Save to Firestore (project-level collection similar to medical interviews)
      const userDocRef = doc(collection(db, `users/${currentUser?.uid || 'anonymous'}/progress-feedback`));
      await setDoc(userDocRef, formDataWithTimestamp);

      // Generate CSV
    /*   const csvData = Object.keys(formDataWithTimestamp)
        .map((key) => {
          const val = Array.isArray(formDataWithTimestamp[key])
            ? (formDataWithTimestamp[key] as string[]).join(';')
            : (formDataWithTimestamp[key] as string | number);
          return `${key},${String(val).replace(/
/g, ' ')}`;
        })
        .join('\n'); */

        const csvRows = Object.keys(formDataWithTimestamp).map((key) => {
  const raw = formDataWithTimestamp[key];
  const val = Array.isArray(raw) ? (raw as string[]).join(';') : (raw as string | number);

  // Strip real newlines and commas inside values to keep CSV rows clean.
  const sanitized = String(val)
    .replaceAll('\n', ' ')
    .replaceAll('\r', ' ')
    .replace(/,/g, ';');

  return `${key},${sanitized}`;
});

const csvData = csvRows.join('\n');

      // Save CSV to Firebase Storage
      const csvRef = ref(storage, `users/${currentUser?.uid || 'anonymous'}/progress-feedback/${timestamp.toISOString()}.csv`);
      await uploadString(csvRef, csvData);

      setGlobalMessage({ message: 'Feedback submitted successfully.', type: 'success' });
      setTimeout(() => navigate('/thank-you', { state: { type: 'progress-feedback' } }), 1500);
    } catch (err) {
      console.error('Error submitting progress feedback:', err);
      setGlobalMessage({ message: 'Error submitting data. Please try again.', type: 'error' });
    }
  };

  return (
    <Frame3 bgColor="bg-blue-50">
      <h2 className="text-3xl font-bold mb-4 text-center">Debug Feedback & Progress</h2>
      <DateTimeDisplay />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
          {progressFeedbackFields
            .filter((field) => field.type !== 'textareascroll')
            .map((field) => {
              if (field.type === 'input') {
                return (
                  <InputField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.inputType}
                    value={(formData[field.name] as string) || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    errors={errors[field.name]}
                  />
                );
              } else if (field.type === 'select') {
                return (
                  <SelectField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={(formData[field.name] as string) || ''}
                    onChange={handleChange}
                    options={field.options}
                    errors={errors[field.name]}
                  />
                );
              } else if (field.type === 'multiSelect') {
                return (
                  // If you later want multi-selects (e.g., multiple devices), enable this branch
                  // and make sure your MultiSelectField API matches MedicalInterviewPage.
                  // @ts-ignore - placeholder to keep structure identical
                  <div key={field.name}></div>
                );
              }
              return null;
            })}
        </div>

        <div className="mt-4">
          <h3 className="text-xl font-bold mb-4">Additional Information</h3>
          {progressFeedbackFields
            .filter((field) => field.type === 'textareascroll')
            .map((field) => (
              <TextAreaField
                key={field.name}
                label={field.label}
                name={field.name}
                value={(formData[field.name] as string) || ''}
                onChange={handleChange}
                errors={errors[field.name]}
              />
            ))}
        </div>

        {globalMessage && <Alert message={globalMessage.message} type={globalMessage.type} />}

        <div className="flex justify-between items-center mt-4">
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">
            Submit
          </Button>
        </div>
      </form>
    </Frame3>
  );
};

export default FeedbackAndProgressPage;

//############################ all is in 

// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Timestamp, collection, doc, setDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { Frame3 } from '../common/Frame';

// // Reuse your existing input components (same API as in MedicalInterviewPage)
// import InputField from '../common/InputField';
// import SelectField from '../common/SelectField';
// import TextAreaField from '../common/TextAreaField';
// import MultiSelectField from '../common/MultiSelectField';
// import Button from '../common/Button';

// // -----------------------------
// // Types
// // -----------------------------

// type Severity = 'Blocker' | 'Major' | 'Minor' | 'Nitpick';

// type BugReport = {
//   id: string;
//   pageOrFeature: string; // e.g., "Typing Test", "Moving Background", "Login", etc.
//   severity: Severity;
//   stepsToReproduce: string;
//   expected: string;
//   actual: string;
//   attachments: string[]; // Firebase Storage URLs
// };

// type FeedbackForm = {
//   testerId: string; // Caltech alias or any identifier
//   email?: string;
//   sessionLabel?: string; // e.g., "debug run #1"
//   // quick ratings (1–5)
//   uiClarity: string;
//   performanceSmoothness: string;
//   difficultyCalibration: string;
//   overall: string;
//   // optional free text
//   topPainPoints: string;
//   suggestions: string;
//   // environment (some auto-detected)
//   deviceType: string; // Laptop, Desktop, Tablet, Phone
//   os: string; // auto-detected best‑effort
//   browser: string; // auto-detected best‑effort
//   screen: string; // e.g., 2560x1440 @ 2x
//   connection?: string; // Wi‑Fi / Ethernet (user-provided)
//   // experiment context
//   typingTestVariant?: string; // e.g., A/B name or hash
//   movingBackground: 'On' | 'Off' | '';
//   tremorMode: 'Stabilization' | 'Baseline' | 'N/A' | '';
//   // bugs & issues
//   bugs: BugReport[];
// };

// // -----------------------------
// // Helpers
// // -----------------------------

// const ratingOptions = [1, 2, 3, 4, 5].map(String);
// const deviceOptions = ['Laptop', 'Desktop', 'Tablet', 'Phone'];
// const onOffOptions = ['On', 'Off'];
// const tremorOptions = ['Stabilization', 'Baseline', 'N/A'];
// const severityOptions: Severity[] = ['Blocker', 'Major', 'Minor', 'Nitpick'];

// function uid() {
//   return Math.random().toString(36).slice(2) + Date.now().toString(36);
// }

// function detectEnv() {
//   const nav = window.navigator as any;
//   const ua = nav.userAgent || '';
//   const vendor = nav.vendor || '';
//   const platform = (nav.userAgentData?.platform || nav.platform || '').toString();
//   const brands = (nav.userAgentData?.brands || [])
//     .map((b: any) => `${b.brand} ${b.version}`)
//     .join(', ');
//   const osGuess = platform || (/(Windows|Mac|Linux|Android|iOS)/i.exec(ua)?.[1] ?? 'Unknown');
//   const browserGuess = brands || (/Chrome|Edg|Firefox|Safari/i.exec(ua)?.[0] ?? 'Unknown');
//   const dpr = Math.round(window.devicePixelRatio * 10) / 10;
//   const screenStr = `${window.screen.width}x${window.screen.height} @ ${dpr}x`;
//   return { osGuess, browserGuess, screenStr, ua, vendor };
// }

// // -----------------------------
// // Component
// // -----------------------------

// const FeedbackAndProgressPage: React.FC = () => {
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const [submitting, setSubmitting] = useState(false);
//   const [globalError, setGlobalError] = useState<string | null>(null);
//   const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

//   const env = useMemo(() => detectEnv(), []);

//   const [form, setForm] = useState<FeedbackForm>(() => ({
//     testerId: '',
//     email: '',
//     sessionLabel: '',
//     uiClarity: '',
//     performanceSmoothness: '',
//     difficultyCalibration: '',
//     overall: '',
//     topPainPoints: '',
//     suggestions: '',
//     deviceType: '',
//     os: env.osGuess,
//     browser: env.browserGuess,
//     screen: env.screenStr,
//     connection: '',
//     typingTestVariant: '',
//     movingBackground: '',
//     tremorMode: '',
//     bugs: [],
//   }));

//   // Basic client-side guards
//   const requiredOK = useMemo(() => {
//     return (
//       !!form.testerId &&
//       !!form.deviceType &&
//       !!form.os &&
//       !!form.browser &&
//       !!form.screen &&
//       !!form.movingBackground &&
//       !!form.tremorMode &&
//       form.overall !== ''
//     );
//   }, [form]);

//   function update<K extends keyof FeedbackForm>(key: K, value: FeedbackForm[K]) {
//     setForm((f) => ({ ...f, [key]: value }));
//     setGlobalError(null);
//     setGlobalSuccess(null);
//   }

//   // -----------------------------
//   // Bugs editor
//   // -----------------------------

//   const addBug = () => {
//     setForm((f) => ({
//       ...f,
//       bugs: [
//         ...f.bugs,
//         {
//           id: uid(),
//           pageOrFeature: '',
//           severity: 'Minor',
//           stepsToReproduce: '',
//           expected: '',
//           actual: '',
//           attachments: [],
//         },
//       ],
//     }));
//   };

//   const removeBug = (id: string) => {
//     setForm((f) => ({ ...f, bugs: f.bugs.filter((b) => b.id !== id) }));
//   };

//   function patchBug<K extends keyof BugReport>(id: string, key: K, value: BugReport[K]) {
//     setForm((f) => ({
//       ...f,
//       bugs: f.bugs.map((b) => (b.id === id ? { ...b, [key]: value } : b)),
//     }));
//   }

//   const uploadBugFiles = async (id: string, files: FileList | null) => {
//     if (!files || files.length === 0) return;
//     const uploads: string[] = [];
//     try {
//       for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         const path = `debug-feedback/${currentUser?.uid ?? 'anon'}/${Date.now()}_${file.name}`;
//         const sref = ref(storage, path);
//         await uploadBytes(sref, file);
//         const url = await getDownloadURL(sref);
//         uploads.push(url);
//       }
//       setForm((f) => ({
//         ...f,
//         bugs: f.bugs.map((b) => (b.id === id ? { ...b, attachments: [...b.attachments, ...uploads] } : b)),
//       }));
//     } catch (err: any) {
//       setGlobalError(err?.message || 'Upload failed.');
//     }
//   };

//   // -----------------------------
//   // Submit
//   // -----------------------------

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setGlobalError(null);
//     setGlobalSuccess(null);

//     if (!requiredOK) {
//       setGlobalError('Please complete all required fields (marked with *).');
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const now = Timestamp.now();
//       const payload = {
//         ...form,
//         // normalize ratings as numbers
//         uiClarity: form.uiClarity === '' ? null : Number(form.uiClarity),
//         performanceSmoothness: form.performanceSmoothness === '' ? null : Number(form.performanceSmoothness),
//         difficultyCalibration: form.difficultyCalibration === '' ? null : Number(form.difficultyCalibration),
//         overall: form.overall === '' ? null : Number(form.overall),
//         // metadata
//         _createdAt: now,
//         _ua: env.ua,
//         _vendor: env.vendor,
//         _tzOffsetMin: new Date().getTimezoneOffset(),
//         _appVersion: (import.meta as any).env?.VITE_APP_VERSION ?? null,
//       };

//       // Firestore: users/{uid}/debug-feedback/{autoId}
//       const uidSafe = currentUser?.uid || 'anonymous';
//       const col = collection(db, `users/${uidSafe}/debug-feedback`);
//       const docRef = doc(col);
//       await setDoc(docRef, payload);

//       setGlobalSuccess('Thanks! Your feedback was saved.');
//       // Optional: navigate to a thank-you page
//       // navigate('/thank-you');

//       // Reset form (keep environment prefill)
//       setForm((f) => ({
//         ...f,
//         testerId: '',
//         email: '',
//         sessionLabel: '',
//         uiClarity: '',
//         performanceSmoothness: '',
//         difficultyCalibration: '',
//         overall: '',
//         topPainPoints: '',
//         suggestions: '',
//         deviceType: '',
//         movingBackground: '',
//         tremorMode: '',
//         typingTestVariant: '',
//         bugs: [],
//       }));
//     } catch (err: any) {
//       console.error(err);
//       setGlobalError(err?.message || 'Something went wrong while saving.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // -----------------------------
//   // UI
//   // -----------------------------

//   return (
//     <Frame3>
//       <div className="min-h-screen w-full flex justify-center bg-gray-50 py-8 px-4">
//         <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl shadow p-6 md:p-10 space-y-8">
//           <header className="space-y-1">
//             <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Debug Feedback & Progress</h1>
//             <p className="text-sm text-gray-600">For the typing-on-moving-background experiment. Provide environment details, rate your experience, and add any bugs/suggestions.</p>
//           </header>

//           {globalError && (
//             <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">{globalError}</div>
//           )}
//           {globalSuccess && (
//             <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 text-sm">{globalSuccess}</div>
//           )}

//           {/* Identity & Session */}
//           <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <InputField
//               label="Tester ID *"
//               name="testerId"
//               value={form.testerId}
//               placeholder="e.g., caltech-alias or initials"
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('testerId', e.target.value)}
//               errors={undefined}
//             />
//             <InputField
//               label="Email (optional)"
//               name="email"
//               type="email"
//               value={form.email || ''}
//               placeholder="Optional contact"
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('email', e.target.value)}
//               errors={undefined}
//             />
//             <InputField
//               label="Session Label"
//               name="sessionLabel"
//               value={form.sessionLabel || ''}
//               placeholder="e.g., debug run #1"
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('sessionLabel', e.target.value)}
//               errors={undefined}
//             />
//           </section>

//           {/* Ratings */}
//           <section>
//             <h2 className="text-lg font-medium mb-3">Quick Ratings</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <SelectField
//                 label="UI clarity *"
//                 name="uiClarity"
//                 value={form.uiClarity}
//                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('uiClarity', e.target.value as any)}
//                 options={ratingOptions}
//                 errors={undefined}
//               />
//               <SelectField
//                 label="Performance smoothness *"
//                 name="performanceSmoothness"
//                 value={form.performanceSmoothness}
//                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('performanceSmoothness', e.target.value as any)}
//                 options={ratingOptions}
//                 errors={undefined}
//               />
//               <SelectField
//                 label="Difficulty calibration *"
//                 name="difficultyCalibration"
//                 value={form.difficultyCalibration}
//                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('difficultyCalibration', e.target.value as any)}
//                 options={ratingOptions}
//                 errors={undefined}
//               />
//               <SelectField
//                 label="Overall *"
//                 name="overall"
//                 value={form.overall}
//                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('overall', e.target.value as any)}
//                 options={ratingOptions}
//                 errors={undefined}
//               />
//             </div>
//           </section>

//           {/* Free text */}
//           <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <TextAreaField
//               label="Top pain points"
//               name="topPainPoints"
//               value={form.topPainPoints}
//               placeholder="What slowed you down most?"
//               onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update('topPainPoints', e.target.value)}
//               errors={undefined}
//             />
//             <TextAreaField
//               label="Suggestions"
//               name="suggestions"
//               value={form.suggestions}
//               placeholder="Improvements, features, copy, metrics, etc."
//               onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update('suggestions', e.target.value)}
//               errors={undefined}
//             />
//           </section>

//           {/* Environment */}
//           <section>
//             <h2 className="text-lg font-medium mb-3">Environment *</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <MultiSelectField
//                 label="Device type *"
//                 name="deviceType"
//                 value={form.deviceType ? [form.deviceType] : []}
//                 onChange={(selectedOptions: string[]) => update('deviceType', selectedOptions[0] ?? '')}
//                 options={deviceOptions}
//                 errors={undefined}
//               />
//               <InputField label="OS *" name="os" value={form.os} onChange={(e: any) => update('os', e.target.value)} errors={undefined} />
//               <InputField label="Browser *" name="browser" value={form.browser} onChange={(e: any) => update('browser', e.target.value)} errors={undefined} />
//               <InputField label="Screen *" name="screen" value={form.screen} onChange={(e: any) => update('screen', e.target.value)} errors={undefined} />
//               <SelectField
//                 label="Connection"
//                 name="connection"
//                 value={form.connection || ''}
//                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('connection', e.target.value)}
//                 options={["Wi‑Fi", "Ethernet", "Cellular"]}
//                 errors={undefined}
//               />
//             </div>
//           </section>

//           {/* Experiment context */}
//           <section>
//             <h2 className="text-lg font-medium mb-3">Experiment Context *</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <InputField
//                 label="Typing test variant"
//                 name="typingTestVariant"
//                 value={form.typingTestVariant || ''}
//                 placeholder="e.g., A / B / hash"
//                 onChange={(e: any) => update('typingTestVariant', e.target.value)}
//                 errors={undefined}
//               />
//               <SelectField
//                 label="Moving background *"
//                 name="movingBackground"
//                 value={form.movingBackground}
//                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('movingBackground', e.target.value as any)}
//                 options={onOffOptions}
//                 errors={undefined}
//               />
//               <SelectField
//                 label="Tremor mode *"
//                 name="tremorMode"
//                 value={form.tremorMode}
//                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('tremorMode', e.target.value as any)}
//                 options={tremorOptions}
//                 errors={undefined}
//               />
//             </div>
//           </section>

//           {/* Bugs & Issues */}
//           <section>
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-lg font-medium">Bugs & Issues</h2>
//               <Button type="button" onClick={addBug}>Add bug</Button>
//             </div>
//             {form.bugs.length === 0 && (
//               <p className="text-sm text-gray-500">No bugs added yet.</p>
//             )}
//             <div className="space-y-6">
//               {form.bugs.map((bug, idx) => (
//                 <div key={bug.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
//                   <div className="flex items-center justify-between">
//                     <h3 className="font-medium">Issue #{idx + 1}</h3>
//                     <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => removeBug(bug.id)}>Remove</button>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     <InputField
//                       label="Page / Feature"
//                       name={`pageOrFeature_${bug.id}`}
//                       value={bug.pageOrFeature}
//                       placeholder="e.g., Typing Test"
//                       onChange={(e: any) => patchBug(bug.id, 'pageOrFeature', e.target.value)}
//                     />
//                     <SelectField
//                       label="Severity"
//                       name={`severity_${bug.id}`}
//                       value={bug.severity}
//                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patchBug(bug.id, 'severity', e.target.value as Severity)}
//                       options={severityOptions}
//                       errors={undefined}
//                     />
//                     <div className="flex flex-col gap-1">
//                       <label className="text-sm font-medium">Attachments</label>
//                       <input
//                         type="file"
//                         multiple
//                         accept="image/*,video/*"
//                         onChange={(e) => uploadBugFiles(bug.id, e.target.files)}
//                         className="block w-full text-sm"
//                       />
//                       {bug.attachments.length > 0 && (
//                         <ul className="list-disc ml-4 text-xs text-gray-600">
//                           {bug.attachments.map((url) => (
//                             <li key={url} className="truncate"><a href={url} target="_blank" className="underline">{url}</a></li>
//                           ))}
//                         </ul>
//                       )}
//                     </div>
//                   </div>
//                   <TextAreaField
//                     label="Steps to reproduce"
//                     name={`steps_${bug.id}`}
//                     value={bug.stepsToReproduce}
//                     placeholder="Click X, then Y…"
//                     onChange={(e: any) => patchBug(bug.id, 'stepsToReproduce', e.target.value)}
//                     errors={undefined}
//                   />
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <TextAreaField
//                       label="Expected"
//                       name={`expected_${bug.id}`}
//                       value={bug.expected}
//                       onChange={(e: any) => patchBug(bug.id, 'expected', e.target.value)}
//                       errors={undefined}
//                     />
//                     <TextAreaField
//                       label="Actual"
//                       name={`actual_${bug.id}`}
//                       value={bug.actual}
//                       onChange={(e: any) => patchBug(bug.id, 'actual', e.target.value)}
//                       errors={undefined}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* Submit */}
//           <footer className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
//             <Button type="submit" disabled={submitting || !requiredOK}>
//               {submitting ? 'Saving…' : 'Submit feedback'}
//             </Button>
//             {!requiredOK && (
//               <span className="text-sm text-gray-500">Fill all * required fields to enable submit.</span>
//             )}
//           </footer>
//         </form>
//       </div>
//     </Frame3>
//   );
// };

// export default FeedbackAndProgressPage;
