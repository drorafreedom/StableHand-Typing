// src/components/pages/TherapyFeedbackPage.tsx
import React, { useEffect, useMemo, useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../data/AuthContext';
import { db, storage } from '../../firebase/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ref as sRef, uploadString } from 'firebase/storage';
import { therapyFeedbackSections } from '../../data/therapyFeedbackSections';

import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import MultiSelectField from '../common/MultiSelectField';
import TextAreaField from '../common/TextAreaField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import DateTimeDisplay from '../common/DateTimeDisplay';
import { Frame3 } from '../common/Frame';

type FormData = Record<string, string | string[] | number>;
type ErrorData = Record<string, string[]>;

function computeAgeFromDOB(dobISO: string, at: Date = new Date()): number | null {
  if (!dobISO) return null;
  const dob = new Date(dobISO);
  if (isNaN(dob.getTime())) return null;
  let age = at.getFullYear() - dob.getFullYear();
  const m = at.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < dob.getDate())) age--;
  return age;
}

function toAgeRange(age: number | null): string | null {
  if (age == null) return null;
  if (age < 18) return '<18';
  if (age <= 24) return '18–24';
  if (age <= 34) return '25–34';
  if (age <= 44) return '35–44';
  if (age <= 54) return '45–54';
  if (age <= 64) return '55–64';
  return '65+';
}

function sanitizeForCSV(value: unknown): string {
  const s = String(value ?? '');
  // Prefer replaceAll; if TS target is old, fall back to split/join.
  return s
    .replaceAll('\n', ' ')
    .replaceAll('\r', ' ')
    .replace(/,/g, ';');
}

// Handles either string[] or { value: string }[] from MultiSelectField
function asStringArray(selected: any): string[] {
  if (!Array.isArray(selected)) return [];
  if (selected.length === 0) return [];
  return typeof selected[0] === 'string' ? selected as string[] : selected.map((o: any) => o.value);
}

const TherapyFeedbackPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<ErrorData>({});
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Optional: prefill environment from navigator
  useEffect(() => {
    const dpr = Math.round(window.devicePixelRatio * 10) / 10;
    const screenStr = `${window.screen.width}x${window.screen.height} @ ${dpr}x`;
    const ua = navigator.userAgent || '';
    const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';
    const brands = (navigator as any).userAgentData?.brands?.map((b: any) => `${b.brand} ${b.version}`).join(', ');
    const osGuess = platform || (/Windows|Mac|Linux|Android|iOS/i.exec(ua)?.[0] ?? 'Unknown');
    const browserGuess = brands || (/Chrome|Edg|Firefox|Safari/i.exec(ua)?.[0] ?? 'Unknown');

    setFormData((p) => ({ ...p, os: p.os || osGuess, browser: p.browser || browserGuess, screen: p.screen || screenStr }));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: [] }));
    setMsg(null);
  };

  const handleMultiSelectChange = (selected: any, name: string) => {
    const values = asStringArray(selected);
    setFormData((p) => ({ ...p, [name]: values }));
    setErrors((p) => ({ ...p, [name]: [] }));
    setMsg(null);
  };

  // If you added the 'animationType' field, this gates sections (waves/shapes/color)
  const animationType = (formData['animationType'] as string) || '';
  const visibleSections = therapyFeedbackSections.filter((sec) => {
    if (['waves','shapes','color'].includes(sec.id)) {
      return sec.id === animationType || animationType === '';
    }
    return true;
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const ts = new Date();
      const userId = currentUser?.uid || 'anonymous';
      const ageAtSession = computeAgeFromDOB(String(formData['dob'] || ''));
      const ageRange = toAgeRange(ageAtSession);

      const payload: Record<string, any> = {
        ...formData,
        userId,
        timestamp: ts.toISOString(),
        localDateTime: ts.toLocaleString(),
        ageAtSession,
        ageRange,
      };

      // Firestore write
      const col = collection(db, `users/${userId}/therapy-feedback`);
      const docRef = doc(col);
      await setDoc(docRef, payload);

      // CSV build
      const rows = Object.keys(payload).map((key) => {
        const raw = payload[key];
        const val = Array.isArray(raw) ? (raw as string[]).join(';') : raw;
        return `${key},${sanitizeForCSV(val)}`;
      });
      const csv = rows.join('\n');

      // Upload CSV
      const fileRef = sRef(storage, `users/${userId}/therapy-feedback/${ts.toISOString()}.csv`);
      await uploadString(fileRef, csv);

      setMsg({ type: 'success', text: 'Thanks! Your feedback was saved.' });
      // optionally navigate('/thank-you');
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: err?.message || 'Error submitting data.' });
    }
  }

  return (
    <Frame3>
      <div className="min-h-screen w-full flex justify-center bg-gray-50 py-8 px-4">
        <form onSubmit={onSubmit} className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl shadow p-6 md:p-10 space-y-10">
          <header className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Therapy Feedback</h1>
            <p className="text-sm text-gray-600">Answer what you used and how it felt. Sections appear based on the animation type.</p>
            <DateTimeDisplay />
          </header>

          {msg && <Alert type={msg.type} message={msg.text} />}

          {visibleSections.map((section) => (
            <section key={section.id} className="space-y-4">
              <h2 className="text-lg font-medium">{section.title}</h2>
              {section.description && <p className="text-sm text-gray-600">{section.description}</p>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {section.fields.map((field) => {
                  const v = formData[field.name];

                  if (field.type === 'input') {
                    return (
                      <InputField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        type={field.inputType}
                        value={(v as string) || ''}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        errors={errors[field.name]}
                      />
                    );
                  }
                  if (field.type === 'select') {
                    return (
                      <SelectField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={(v as string) || ''}
                        onChange={handleChange}
                        options={field.options}
                        errors={errors[field.name]}
                      />
                    );
                  }
                  if (field.type === 'multiSelect') {
                    return (
                      <MultiSelectField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={(v as string[]) || []}
                        onChange={(selected: any) => handleMultiSelectChange(selected, field.name)}
                        options={field.options}
                        errors={errors[field.name]}
                      />
                    );
                  }
                  if (field.type === 'textareascroll') {
                    return (
                      <TextAreaField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={(v as string) || ''}
                        onChange={handleChange}
                        errors={errors[field.name]}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </section>
          ))}

          <footer className="flex items-center gap-3">
            <Button type="submit">Submit</Button>
          </footer>
        </form>
      </div>
    </Frame3>
  );
};

export default TherapyFeedbackPage;
