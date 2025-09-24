// src/components/pages/MedicalInterviewPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../data/AuthContext';
import { db, storage } from '../../firebase/firebase';

import SelectField from '../common/SelectField';
import SelectWithOtherField from '../common/SelectWithOtherField';
import MultiSelectField from '../common/MultiSelectField';
import MultiSelectWithOtherField from '../common/MultiSelectWithOtherField';
import InputField from '../common/InputField';
import TextAreaField from '../common/TextAreaField';
import Button from '../common/Button';
import Alert, { type AlertType } from '../common/Alert';
import DateTimeDisplay from '../common/DateTimeDisplay';
import { Frame3 } from '../common/Frame';

import { medicalInterviewFields } from '../../data/medicalInterviewFields';

// validation (uses whatever is defined in your utils; safe if some are unused)
import {
  validateDOB,
  compareAgeWithDOB,
} from '../../utils/validation';

// shared questionnaire save util (namespaced by slug)
import {
  type QnrCtx,
  qnrLoadLocal, qnrSaveLocal, qnrClearLocal,
  qnrLoadDraft, qnrSaveDraft, qnrSubmitFinal,
} from '../../utils/questionnaireSave';

// ---------- pure helpers (NO hooks here) ----------
type FormState = Record<string, any>;
type ErrorsState = Record<string, string[]>;

const getValue = (s: FormState, name: string) =>
  s[name] ?? (Array.isArray(s[name]) ? [] : s[name]);

const barColor = (idx: number) =>
  ['bg-indigo-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500'][idx % 5];

const normalizeArray = (arr: any[]): string[] =>
  Array.from(
    new Set(
      (arr || [])
        .map((m: any) => (typeof m === 'string' ? m : m?.value ?? m?.label ?? ''))
        .filter((x: string) => x && x !== 'None' && x !== 'Prefer not to say')
    )
  );

const medKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

// ---------- component (ALL hooks must stay inside) ----------
export default function MedicalInterviewPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Alert state (uses your Alert component)
  type AppAlert = { key: string; message: string; type: AlertType };
  const [appAlert, setAppAlert] = useState<AppAlert | null>(null);
  const showAlert = (type: AlertType, message: string) =>
    setAppAlert({ key: Math.random().toString(36).slice(2), type, message });

  // Build context for THIS questionnaire
  const slug = 'medical-interview'; // <- change per page (demographics, feedback, etc.)
  const ctx: QnrCtx = { db, storage, uid: currentUser?.uid, slug };

  // Form state bootstrapped from local autosave for THIS questionnaire
  const [form, setForm] = useState<FormState>(() => qnrLoadLocal(ctx) ?? {});
  const [errors, setErrors] = useState<ErrorsState>({});

  // autosave to localStorage every 3s while typing
  useEffect(() => {
    const id = setInterval(() => qnrSaveLocal(ctx, form), 3000);
    return () => clearInterval(id);
  }, [ctx.uid, ctx.slug, form]);

  const setField = (name: string, value: any) => setForm((prev) => ({ ...prev, [name]: value }));

  // DOB → age auto-calc (age not shown as input, just derived)
  useEffect(() => {
    if (!form.dob) return;
    const birth = new Date(form.dob);
    if (isNaN(birth.getTime())) return;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    if (age >= 0 && age <= 120 && form.age !== age) {
      setForm((prev) => ({ ...prev, age }));
    }
  }, [form.dob]);

  // conditional field rendering (old-style showIf)
  function shouldShow(field: any, state: FormState) {
    const cond = field.showIf;
    if (!cond) return true;
    const v = state[cond.name];
    const list = cond.includesAny || cond.equalsAny;
    if (!list) return true;
    if (Array.isArray(v)) return v.some((x) => list.includes(x));
    return list.includes(v);
  }

  // selected medications (normalized)
  const selectedMeds = normalizeArray(form.current_meds_list);

  // hide old hard-wired med fields + global side-effects
  const shouldSkipInMedSection = (fieldName: string) => {
    const legacy = new Set([
      'levodopa_dose_mg',
      'levodopa_times_per_day',
      'levodopa_effect',
      'propranolol_daily_mg',
      'primidone_daily_mg',
      'levodopa_duration_value',
      'levodopa_duration_units',
      'propranolol_duration_value',
      'propranolol_duration_units',
      'primidone_duration_value',
      'primidone_duration_units',
      'med_side_effects',
    ]);
    return legacy.has(fieldName);
  };

  // per-med subforms (4 columns)
  const baseMed = (lbl: string, field: string) => `meds.${medKey(lbl)}.${field}`;
  const renderMedCard = (medLabel: string) => (
    <div key={medLabel} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-sm font-semibold mb-2">{medLabel}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <InputField
          label="Dose per intake (mg)"
          name={baseMed(medLabel, 'dose_mg')}
          type="text"
          value={String(getValue(form, baseMed(medLabel, 'dose_mg')) ?? '')}
          placeholder="e.g., 100"
          onChange={(e) => setField(baseMed(medLabel, 'dose_mg'), e.target.value)}
        />
        <InputField
          label="Times per day"
          name={baseMed(medLabel, 'times_per_day')}
          type="text"
          value={String(getValue(form, baseMed(medLabel, 'times_per_day')) ?? '')}
          placeholder="e.g., 3"
          onChange={(e) => setField(baseMed(medLabel, 'times_per_day'), e.target.value)}
        />
        <InputField
          label="Time on this med (value)"
          name={baseMed(medLabel, 'duration_value')}
          type="text"
          value={String(getValue(form, baseMed(medLabel, 'duration_value')) ?? '')}
          placeholder="e.g., 12"
          onChange={(e) => setField(baseMed(medLabel, 'duration_value'), e.target.value)}
        />
        <SelectField
          label="Time on this med (units)"
          name={baseMed(medLabel, 'duration_units')}
          value={String(getValue(form, baseMed(medLabel, 'duration_units')) ?? '')}
          options={['weeks', 'months', 'years']}
          onChange={(e) => setField(baseMed(medLabel, 'duration_units'), e.target.value)}
        />
        <SelectField
          label="Overall benefit"
          name={baseMed(medLabel, 'effect')}
          value={String(getValue(form, baseMed(medLabel, 'effect')) ?? '')}
          options={['No benefit', 'Slight', 'Moderate', 'Marked', 'Not sure', 'N/A']}
          onChange={(e) => setField(baseMed(medLabel, 'effect'), e.target.value)}
        />
        <MultiSelectWithOtherField
          label="Side effects (select any)"
          name={baseMed(medLabel, 'side_effects')}
          values={getValue(form, baseMed(medLabel, 'side_effects')) || []}
          options={[
            'Nausea',
            'Dizziness/lightheadedness',
            'Sleepiness',
            'Impulse control issues',
            'Hallucinations',
            'Confusion',
            'Dry mouth',
            'Fatigue',
            'Weight change',
            'Other',
            'None',
            'Prefer not to say',
          ]}
          onChange={(values /*,_name*/) => setField(baseMed(medLabel, 'side_effects'), values)}
        />
      </div>
    </div>
  );

  // tolerant field renderer (handles both .component and legacy .type/.inputType)
  const renderField = (field: any) => {
    if (!shouldShow(field, form)) return null;
    const common = { label: field.label, name: field.name, errors: errors[field.name] || [] };

    // normalize type
    const kindRaw = (field.component || field.type || '').toString().toLowerCase();
    const inputHtmlType = (field.inputType || field.htmlType || field.type || 'text').toString();

    switch (kindRaw) {
      case 'select':
        return (
          <SelectField
            {...common}
            value={getValue(form, field.name) || ''}
            options={field.options || []}
            onChange={(e) => setField(field.name, e.target.value)}
          />
        );
      case 'selectwithother':
        return (
          <SelectWithOtherField
            {...common}
            value={getValue(form, field.name) || ''}
            options={field.options || []}
            onChange={({ target }) => setField(field.name, target.value)}
          />
        );
      case 'multiselect':
      case 'multiselectfield':
      case 'multiselectwithotherfield': // be lenient
      case 'multiselectwithother':
        if (kindRaw.includes('withother')) {
          return (
            <MultiSelectWithOtherField
              {...common}
              values={getValue(form, field.name) || []}
              options={field.options || []}
              onChange={(values /*,_name*/) => setField(field.name, values)}
            />
          );
        }
        return (
          <MultiSelectField
            {...common}
            value={getValue(form, field.name) || []}
            options={field.options || []}
            onChange={(values /*,_name*/) => setField(field.name, values)}
          />
        );
      case 'textarea':
        return (
          <TextAreaField
            {...common}
            value={String(getValue(form, field.name) ?? '')}
            onChange={(e) => setField(field.name, e.target.value)}
          />
        );
      case 'input':
      default:
        return (
          <InputField
            {...common}
            type={inputHtmlType} // 'text' | 'date' | 'number' | ...
            value={String(getValue(form, field.name) ?? '')}
            placeholder={field.placeholder || ''}
            onChange={(e) => setField(field.name, e.target.value)}
          />
        );
    }
  };

  // validation runner using optional validators from data
  const runValidationAll = (): boolean => {
    const newErrs: ErrorsState = {};
    let hasErr = false;

    const sections: any[] = Array.isArray(medicalInterviewFields) ? medicalInterviewFields : [];
    sections.forEach((sec) =>
      (sec.fields || []).forEach((f: any) => {
        const value = form[f.name];
        if (f.validate && Array.isArray(f.validate)) {
          const errs = f.validate.flatMap((vfn: any) => {
            try {
              return typeof vfn === 'function' ? vfn(value, form) : [];
            } catch {
              return [];
            }
          });
          if (errs.length) {
            newErrs[f.name] = errs;
            hasErr = true;
          }
        }
      })
    );

    // DOB cross-checks
    if (form.dob) {
      const dobErrs = (validateDOB ? validateDOB(form.dob) : []) || [];
      if (dobErrs.length) {
        newErrs['dob'] = (newErrs['dob'] || []).concat(dobErrs);
        hasErr = true;
      }
      if (form.age != null && compareAgeWithDOB) {
        const cmp = compareAgeWithDOB(String(form.dob), Number(form.age));
        if (cmp.length) {
          newErrs['dob'] = (newErrs['dob'] || []).concat(cmp);
          hasErr = true;
        }
      }
    }

    setErrors(newErrs);
    return !hasErr;
  };

  // ---------- load/save/submit via questionnaireSave ----------
  const handleLoadDraft = async () => {
    try {
      const res = await qnrLoadDraft(ctx);
      if (!res) { showAlert('info', 'No draft found.'); return; }
      setForm(res.data);
      qnrSaveLocal(ctx, res.data);
      showAlert('success', 'Draft loaded.');
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load draft.');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await qnrSaveDraft(ctx, form);
      qnrSaveLocal(ctx, form);
      showAlert('success', 'Draft saved.');
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to save draft.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runValidationAll()) { showAlert('error', 'Please fix the highlighted fields.'); return; }
    try {
      await qnrSubmitFinal(ctx, form, { awaitUpload: false, writeHistory: false });
      qnrClearLocal(ctx);
      showAlert('success', 'Final submitted.');
    } catch (e) {
      console.error(e);
      showAlert('error', 'Submit failed. Please try again.');
    }
  };

  // ----------------------------- render ------------------------------
  return (
    <Frame3 bgColor="bg-orange-100">
      <h2 className="text-3xl font-bold mb-4 text-center">Medical Interview</h2>
      <div className="flex justify-end mb-2">
        <DateTimeDisplay />
      </div>


      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl p-4 space-y-8">
        {medicalInterviewFields.map((section: any, idx: number) => (
          <section
            key={section.id}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            <div className={`h-1 w-full ${barColor(idx)}`} />

            <div className="p-4 md:p-6">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.description && (
                <p className="mt-1 text-sm text-slate-600">{section.description}</p>
              )}

              {/* 4-column responsive grid */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.fields.map((f: any) => {
                  if (section.id === 'medications' && shouldSkipInMedSection(f.name)) return null;
                  const full = f.fullWidth ? 'lg:col-span-4 md:col-span-2 col-span-1' : '';
                  return (
                    <div key={f.name} className={full}>
                      {renderField(f)}
                    </div>
                  );
                })}
              </div>

              {/* Per-medication sub-forms (EMR-like) */}
              {section.id === 'medications' && selectedMeds.length > 0 && (
                <div className="mt-4 space-y-4">
                  {selectedMeds.map((m) => renderMedCard(m))}
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Actions at bottom */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
        
      {appAlert && <Alert key={appAlert.key} type={appAlert.type} message={appAlert.message} />}
          <Button type="button" onClick={handleLoadDraft} className="bg-slate-400 hover:bg-slate-500">
            Load draft
          </Button>
          <Button type="button" onClick={handleSaveDraft} className="bg-slate-500 hover:bg-slate-600">
            Save draft
          </Button>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
            Submit
          </Button>
        </div>
      </form>
    </Frame3>
  );
}






// // src/components/pages/MedicalInterviewPage.tsx
// //wroking new version 99.23 for new set of questions , as well as save draft load and final
// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   collection,
//   doc,
//   setDoc,
//   serverTimestamp,
//   getDocs,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDoc,
// } from 'firebase/firestore';
// import { ref, uploadString } from 'firebase/storage';

// import { useAuth } from '../../data/AuthContext';
// import { db, storage } from '../../firebase/firebase';

// import SelectField from '../common/SelectField';
// import SelectWithOtherField from '../common/SelectWithOtherField';
// import MultiSelectField from '../common/MultiSelectField';
// import MultiSelectWithOtherField from '../common/MultiSelectWithOtherField';
// import InputField from '../common/InputField';
// import TextAreaField from '../common/TextAreaField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';
// import DateTimeDisplay from '../common/DateTimeDisplay';
// import { Frame3 } from '../common/Frame';

// import { medicalInterviewFields } from '../../data/medicalInterviewFields';
 
// // Optional validation helpers (present in your repo)
// import {
//   validatePositiveNumber,
//   validateEmail,
//   validatePhoneNumber,
//   validateRequired,
//   validateDOB,
//   validateAge,
//   compareAgeWithDOB,
// } from '../../utils/validation';



// // ---------- helpers ----------
// type FormState = Record<string, any>;
// type ErrorsState = Record<string, string[]>;

// const getValue = (s: FormState, name: string) =>
//   s[name] ?? (Array.isArray(s[name]) ? [] : s[name]);

// const barColor = (idx: number) =>
//   ['bg-indigo-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500'][idx % 5];

// const normalizeArray = (arr: any[]): string[] =>
//   Array.from(
//     new Set(
//       (arr || [])
//         .map((m: any) => (typeof m === 'string' ? m : m?.value ?? m?.label ?? ''))
//         .filter((x: string) => x && x !== 'None' && x !== 'Prefer not to say')
//     )
//   );

// const LS_KEY = 'medicalInterviewDraft';
// const saveLocal = (data: Record<string, any>) => {
//   try {
//     localStorage.setItem(LS_KEY, JSON.stringify(data));
//   } catch {}
// };
// const loadLocal = (): Record<string, any> | null => {
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// };
// const clearLocal = () => {
//   try {
//     localStorage.removeItem(LS_KEY);
//   } catch {}
// };

// const medKey = (label: string) =>
//   label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

// function toCsv(payload: Record<string, any>): string {
//   const lines: string[] = [];
//   for (const [k, v] of Object.entries(payload)) {
//     if (Array.isArray(v)) lines.push(`${k},"${v.join(';')}"`);
//     else if (typeof v === 'object' && v !== null) lines.push(`${k},"${JSON.stringify(v)}"`);
//     else lines.push(`${k},${v ?? ''}`);
//   }
//   return lines.join('\n');
// }

// // ---------- component ----------
// export default function MedicalInterviewPage() {
//   const navigate = useNavigate();
//   const { currentUser } = useAuth();

//   // state
//   const [form, setForm] = useState<FormState>(() => loadLocal() ?? {});
//   const [errors, setErrors] = useState<ErrorsState>({});
//   const [globalMsg, setGlobalMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
//   const [draftId, setDraftId] = useState<string | undefined>(undefined);
//   const collectionPath = useMemo(
//     () => `users/${currentUser?.uid || 'anonymous'}/medical-interviews`,
//     [currentUser?.uid]
//   ); // Always write/read the draft/final to this deterministic doc id
// const DRAFT_DOC_ID = 'current';

// //-----------------------alert
// type AppAlert = { key: string; message: string; type: AlertType };

// const [appAlert, setAppAlert] = useState<AppAlert | null>(null);
// const showAlert = (type: AlertType, message: string) =>
//   setAppAlert({ key: Math.random().toString(36).slice(2), type, message });
// //----------------------------------------------

//   // autosave to localStorage every 3s while typing
//   useEffect(() => {
//     const id = setInterval(() => saveLocal(form), 3000);
//     return () => clearInterval(id);
//   }, [form]);

//   const setField = (name: string, value: any) => {
//     setForm((prev) => ({ ...prev, [name]: value }));
//     setGlobalMsg(null);
//   };

//   // DOB → age auto-calc (no manual age input needed)
//   useEffect(() => {
//     if (!form.dob) return;
//     const birth = new Date(form.dob);
//     if (isNaN(birth.getTime())) return;

//     const now = new Date();
//     let age = now.getFullYear() - birth.getFullYear();
//     const m = now.getMonth() - birth.getMonth();
//     if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
//     if (age < 0 || age > 120) return; // sanity guard
//     if (form.age !== age) setForm((prev) => ({ ...prev, age })); // store derived age (not shown as input)
//   }, [form.dob]); // eslint-disable-line react-hooks/exhaustive-deps

//   // conditional field rendering (old-style showIf)
//   function shouldShow(field: any, state: FormState) {
//     const cond = field.showIf;
//     if (!cond) return true;
//     const v = state[cond.name];
//     const list = cond.includesAny || cond.equalsAny;
//     if (!list) return true;
//     if (Array.isArray(v)) return v.some((x) => list.includes(x));
//     return list.includes(v);
//   }

//   // selected medications (normalized)
//   const selectedMeds = normalizeArray(form.current_meds_list);

//   // hide old per-med fields + global side-effects picker
//   const shouldSkipInMedSection = (fieldName: string) => {
//     const legacy = new Set([
//       'levodopa_dose_mg',
//       'levodopa_times_per_day',
//       'levodopa_effect',
//       'propranolol_daily_mg',
//       'primidone_daily_mg',
//       'levodopa_duration_value',
//       'levodopa_duration_units',
//       'propranolol_duration_value',
//       'propranolol_duration_units',
//       'primidone_duration_value',
//       'primidone_duration_units',
//       'med_side_effects',
//     ]);
//     return legacy.has(fieldName);
//   };

//   // per-med subforms (4 columns)
//   const baseMed = (lbl: string, field: string) => `meds.${medKey(lbl)}.${field}`;
//   const renderMedCard = (medLabel: string) => (
//     <div key={medLabel} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
//       <div className="text-sm font-semibold mb-2">{medLabel}</div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//         <InputField
//           label="Dose per intake (mg)"
//           name={baseMed(medLabel, 'dose_mg')}
//           type="text"
//           value={String(getValue(form, baseMed(medLabel, 'dose_mg')) ?? '')}
//           placeholder="e.g., 100"
//           onChange={(e) => setField(baseMed(medLabel, 'dose_mg'), e.target.value)}
//         />
//         <InputField
//           label="Times per day"
//           name={baseMed(medLabel, 'times_per_day')}
//           type="text"
//           value={String(getValue(form, baseMed(medLabel, 'times_per_day')) ?? '')}
//           placeholder="e.g., 3"
//           onChange={(e) => setField(baseMed(medLabel, 'times_per_day'), e.target.value)}
//         />
//         <InputField
//           label="Time on this med (value)"
//           name={baseMed(medLabel, 'duration_value')}
//           type="text"
//           value={String(getValue(form, baseMed(medLabel, 'duration_value')) ?? '')}
//           placeholder="e.g., 12"
//           onChange={(e) => setField(baseMed(medLabel, 'duration_value'), e.target.value)}
//         />
//         <SelectField
//           label="Time on this med (units)"
//           name={baseMed(medLabel, 'duration_units')}
//           value={String(getValue(form, baseMed(medLabel, 'duration_units')) ?? '')}
//           options={['weeks', 'months', 'years']}
//           onChange={(e) => setField(baseMed(medLabel, 'duration_units'), e.target.value)}
//         />
//         <SelectField
//           label="Overall benefit"
//           name={baseMed(medLabel, 'effect')}
//           value={String(getValue(form, baseMed(medLabel, 'effect')) ?? '')}
//           options={['No benefit', 'Slight', 'Moderate', 'Marked', 'Not sure', 'N/A']}
//           onChange={(e) => setField(baseMed(medLabel, 'effect'), e.target.value)}
//         />
//         <MultiSelectWithOtherField
//           label="Side effects (select any)"
//           name={baseMed(medLabel, 'side_effects')}
//           values={getValue(form, baseMed(medLabel, 'side_effects')) || []}
//           options={[
//             'Nausea',
//             'Dizziness/lightheadedness',
//             'Sleepiness',
//             'Impulse control issues',
//             'Hallucinations',
//             'Confusion',
//             'Dry mouth',
//             'Fatigue',
//             'Weight change',
//             'Other',
//             'None',
//             'Prefer not to say',
//           ]}
//           onChange={(values /*,_name*/) => setField(baseMed(medLabel, 'side_effects'), values)}
//         />
//       </div>
//     </div>
//   );

//   // generic field renderer (old-style)
//   const renderField = (field: any) => {
//     if (!shouldShow(field, form)) return null;
//     const common = { label: field.label, name: field.name, errors: errors[field.name] || [] };

//     switch (field.component) {
//       case 'select':
//         return (
//           <SelectField
//             {...common}
//             value={getValue(form, field.name) || ''}
//             options={field.options || []}
//             onChange={(e) => setField(field.name, e.target.value)}
//           />
//         );
//       case 'selectWithOther':
//         return (
//           <SelectWithOtherField
//             {...common}
//             value={getValue(form, field.name) || ''}
//             options={field.options || []}
//             onChange={({ target }) => setField(field.name, target.value)}
//           />
//         );
//       case 'multiselect':
//         return (
//           <MultiSelectField
//             {...common}
//             value={getValue(form, field.name) || []}
//             options={field.options || []}
//             onChange={(values /*,_name*/) => setField(field.name, values)}
//           />
//         );
//       case 'multiselectWithOther':
//         return (
//           <MultiSelectWithOtherField
//             {...common}
//             values={getValue(form, field.name) || []}
//             options={field.options || []}
//             onChange={(values /*,_name*/) => setField(field.name, values)}
//           />
//         );
//       case 'input':
//         return (
//           <InputField
//             {...common}
//             type={field.type || 'text'}
//             value={String(getValue(form, field.name) ?? '')}
//             placeholder={field.placeholder || ''}
//             onChange={(e) => setField(field.name, e.target.value)}
//           />
//         );
//       case 'textarea':
//         return (
//           <TextAreaField
//             {...common}
//             value={String(getValue(form, field.name) ?? '')}
//             onChange={(e) => setField(field.name, e.target.value)}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   // validation runner (if a field has .validate array like your original)
//   const runValidationAll = (): boolean => {
//     const newErrs: ErrorsState = {};
//     let hasErr = false;

//     // If your data file carries field-level validators:
//     const sections: any[] = Array.isArray(medicalInterviewFields)
//       ? medicalInterviewFields
//       : [];
//     sections.forEach((sec) =>
//       (sec.fields || []).forEach((f: any) => {
//         const value = form[f.name];
//         if (f.validate && Array.isArray(f.validate)) {
//           const errs = f.validate.flatMap((vfn: any) => {
//             try {
//               return typeof vfn === 'function' ? vfn(value, form) : [];
//             } catch {
//               return [];
//             }
//           });
//           if (errs.length) {
//             newErrs[f.name] = errs;
//             hasErr = true;
//           }
//         }
//       })
//     );

//     // Cross-field DOB/age check if present
//     if (form.dob) {
//       const dobErrs = (validateDOB ? validateDOB(form.dob) : []) || [];
//       if (dobErrs.length) {
//         newErrs['dob'] = (newErrs['dob'] || []).concat(dobErrs);
//         hasErr = true;
//       }
//       if (form.age != null && compareAgeWithDOB) {
//         const cmp = compareAgeWithDOB(String(form.dob), Number(form.age));
//         if (cmp.length) {
//           newErrs['dob'] = (newErrs['dob'] || []).concat(cmp);
//           hasErr = true;
//         }
//       }
//     }

//     setErrors(newErrs);
//     return !hasErr;
//   };

//   // --------- load/save/submit ----------
// /*   const handleLoadDraft = async () => {
//     try {
//       const qref = query(
//         collection(db, collectionPath),
//         where('status', '==', 'draft'),
//         orderBy('updatedAt', 'desc'),
//         limit(1)
//       );
//       const snap = await getDocs(qref);
//       if (snap.empty) {
//         setGlobalMsg({ type: 'info', text: 'No draft found.' });
//         return;
//       }
//       const docSnap = snap.docs[0];
//       const data = (docSnap.data() as any)?.data || {};
//       setForm(data);
//       setDraftId(docSnap.id);
//       saveLocal(data);
//       setGlobalMsg({ type: 'success', text: 'Draft loaded.' });
//     } catch (e) {
//       console.error(e);
//       setGlobalMsg({ type: 'error', text: 'Failed to load draft.' });
//     }
//   }; */
// const handleLoadDraft = async () => {
//   try {
//     // 1) try the fixed draft doc
//     const fixedRef = doc(db, collectionPath, DRAFT_DOC_ID);
//     const fixedSnap = await getDoc(fixedRef);
//     if (fixedSnap.exists()) {
//       const data = (fixedSnap.data() as any)?.data || {};
//       setForm(data);
//       setDraftId(DRAFT_DOC_ID);
//       saveLocal(data);
//       setGlobalMsg({ type: 'success', text: 'Draft loaded.' });
//       return;
//     }



//     // 2) fallback: latest “status:draft” (older app versions)
//     const qref = query(
//       collection(db, collectionPath),
//       where('status', '==', 'draft'),
//       orderBy('updatedAt', 'desc'),
//       limit(1)
//     );
//     const snap = await getDocs(qref);
//     if (!snap.empty) {
//       const docSnap = snap.docs[0];
//       const data = (docSnap.data() as any)?.data || {};
//       setForm(data);
//       setDraftId(DRAFT_DOC_ID);        // switch to fixed id going forward
//       saveLocal(data);
//       // migrate into the fixed doc so future saves overwrite
//       await setDoc(fixedRef, { ...docSnap.data(), migratedFrom: docSnap.id }, { merge: true });
//          showAlert('success', 'Draft loaded.');
//       return;
//     }
// showAlert('error', 'No draft found.');
    
//   } catch (e) {
//     console.error(e);
//     showAlert('error', 'Failed to load draft.');
//   }
// };

// /*   const handleSaveDraft = async () => {
//     try {
//       const id = draftId || doc(collection(db, collectionPath)).id;
//       const docRef = doc(db, collectionPath, id);
//       await setDoc(
//         docRef,
//         {
//           uid: currentUser?.uid ?? null,
//           status: 'draft',
//           updatedAt: serverTimestamp(),
//           data: form,
//         },
//         { merge: true }
//       );
//       setDraftId(id);
//       saveLocal(form);
//       setGlobalMsg({ type: 'success', text: 'Draft saved.' });
//     } catch (e) {
//       console.error(e);
//       setGlobalMsg({ type: 'error', text: 'Failed to save draft.' });
//     }
//   };
//  */
  
//   const handleSaveDraft = async () => {
//   try {
//     const id = DRAFT_DOC_ID;
//     const docRef = doc(db, collectionPath, id);
//     await setDoc(
//       docRef,
//       {
//         uid: currentUser?.uid ?? null,
//         status: 'draft',
//         updatedAt: serverTimestamp(),
//         data: form,
//       },
//       { merge: true }                    // ⬅️ overwrite / upsert
//     );
//     setDraftId(id);
//     saveLocal(form);
//     setGlobalMsg({ type: 'success', text: 'Draft saved.' });
//   } catch (e) {
//     console.error(e);
//     setGlobalMsg({ type: 'error', text: 'Failed to save draft.' });
//   }
// };
// /* 
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!runValidationAll()) {
//       setGlobalMsg({ type: 'error', text: 'Please fix the highlighted fields.' });
//       return;
//     }

//     try {
//       const id = doc(collection(db, collectionPath)).id;
//       const docRef = doc(db, collectionPath, id);
//       await setDoc(docRef, {
//         uid: currentUser?.uid ?? null,
//         status: 'final',
//         createdAt: serverTimestamp(),
//         data: form,
//       });

//       const csv = toCsv({ ...form, _docId: id });
//       const ts = new Date().toISOString();
//       const csvRef = ref(storage, `${collectionPath}/${id}/${ts}.csv`);
//       await uploadString(csvRef, csv, 'raw');

//       clearLocal();
//       setGlobalMsg({ type: 'success', text: 'Submitted.' });
//       // navigate('/thank-you', { state: { type: 'medical' } });
//     } catch (e) {
//       console.error(e);
//       setGlobalMsg({ type: 'error', text: 'Submit failed. Please try again.' });
//     }
//   }; */
// /* const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!runValidationAll()) {
//     setGlobalMsg({ type: 'error', text: 'Please fix the highlighted fields.' });
//     return;
//   }

//   try {
//     const id = DRAFT_DOC_ID;
//     const docRef = doc(db, collectionPath, id);

//     await setDoc(
//       docRef,
//       {
//         uid: currentUser?.uid ?? null,
//         status: 'final',
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//         data: form,
//       },
//       { merge: true }                    // ⬅️ overwrite / upsert
//     );

//     // also export CSV snapshot for audit
//     const csv = toCsv({ ...form, _docId: id });
//     const ts = new Date().toISOString();
//     const csvRef = ref(storage, `${collectionPath}/${id}/${ts}.csv`);
//     await uploadString(csvRef, csv, 'raw');

//     clearLocal();
//     setGlobalMsg({ type: 'success', text: 'Submitted.' });
//   } catch (e) {
//     console.error(e);
//     setGlobalMsg({ type: 'error', text: 'Submit failed. Please try again.' });
//   }
// }; */
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!runValidationAll()) {
//     showAlert('error', 'Please fix the highlighted fields.');
//     return;
//   }

//   try {
//     // ... your setDoc(... status:'final', merge:true ...) + CSV upload
//     clearLocal();
//     showAlert('success', 'Final submitted.');
//   } catch (e) {
//     console.error(e);
//     showAlert('error', 'Submit failed. Please try again.');
//   }
// };

//   // ----------------------------- render ------------------------------
//   return (
//     <Frame3 bgColor="bg-orange-100">
//       <h2 className="text-3xl font-bold mb-4 text-center">Medical Interview</h2>
//       <div className="flex justify-end mb-2">
//         <DateTimeDisplay />
//       </div>


//       <form onSubmit={handleSubmit} className="mx-auto max-w-7xl p-4 space-y-8">
//         {medicalInterviewFields.map((section: any, idx: number) => (
//           <section
//             key={section.id}
//             className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
//           >
//             <div className={`h-1 w-full ${barColor(idx)}`} />

//             <div className="p-4 md:p-6">
//               <h2 className="text-xl font-semibold">{section.title}</h2>
//               {section.description && (
//                 <p className="mt-1 text-sm text-slate-600">{section.description}</p>
//               )}

//               {/* 4-column responsive grid */}
//               <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {section.fields.map((f: any) => {
//                   if (section.id === 'medications' && shouldSkipInMedSection(f.name)) return null;
//                   const full = f.fullWidth ? 'lg:col-span-4 md:col-span-2 col-span-1' : '';
//                   return (
//                     <div key={f.name} className={full}>
//                       {renderField(f)}
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Per-medication sub-forms (EMR-like) */}
//               {section.id === 'medications' && selectedMeds.length > 0 && (
//                 <div className="mt-4 space-y-4">
//                   {selectedMeds.map((m) => renderMedCard(m))}
//                 </div>
//               )}
//             </div>
//           </section>
//         ))}

//         {/* Actions at bottom */}
//         <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
//           {/* {globalMsg && <Alert message={globalMsg.text} type={globalMsg.type} />} */}
//       {appAlert && <Alert key={appAlert.key} type={appAlert.type} message={appAlert.message} />} 
//       <Button type="button" onClick={handleLoadDraft} className="bg-slate-400 hover:bg-slate-500">
//             Load draft
//           </Button>
//           <Button type="button" onClick={handleSaveDraft} className="bg-slate-500 hover:bg-slate-600">
//             Save draft
//           </Button>
//           <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
//             Submit
//           </Button>
          
     

//         </div>
//       </form>
//     </Frame3>
//   );
// }


// // src/components/pages/MedicalInterviewPage.tsx

// import React, { useState, ChangeEvent, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { collection, doc, setDoc } from 'firebase/firestore';
// import { useAuth } from '../../data/AuthContext';
// import { db, storage } from '../../firebase/firebase';
// import InputField from '../common/InputField';
// import SelectField from '../common/SelectField';
// import SelectWithOtherField from '../common/SelectWithOtherField';
// import MultiSelectField from '../common/MultiSelectField';
// import TextAreaField from '../common/TextAreaField';
// import MultiSelectWithOtherField from '../common/MultiSelectWithOtherField';
// import AutosizeInputField from '../common/AutosizeInputField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';
// import DateTimeDisplay from '../common/DateTimeDisplay';
// import { medicalInterviewFields } from '../../data/medicalInterviewFields';
// import { ref, uploadString } from 'firebase/storage';
// import {
//   validatePositiveNumber,
//   validateEmail,
//   validatePhoneNumber,
//   validateRequired,
//   validateDOB,
//   validateAge,
//   compareAgeWithDOB,
// } from '../../utils/validation';
// import { Frame3 } from '../common/Frame';

// interface FormData {
//   [key: string]: string | string[] | number;
// }

// interface ErrorData {
//   [key: string]: string[];
// }

// const MedicalInterviewPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { currentUser } = useAuth();
//   const [formData, setFormData] = useState<FormData>({});
//   const [errors, setErrors] = useState<ErrorData>({});
//   const [globalMessage, setGlobalMessage] = useState<{ message: string; type: string } | null>(null);

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     const field = medicalInterviewFields.find((field) => field.name === name);
//     if (field && field.validate) {
//       const validationErrors = field.validate.map((validate) => validate(value, formData)).flat();
//       if (validationErrors.length === 0) {
//         setErrors((prev) => ({ ...prev, [name]: [] }));
//       } else {
//         setErrors((prev) => ({ ...prev, [name]: validationErrors }));
//       }
//     } else {
//       setErrors((prev) => ({ ...prev, [name]: [] }));
//     }
//     setGlobalMessage(null); // Clear global message on individual field change
//   };
// const handleMultiSelectChange = (selectedValues: string[], name: string) => {
//   setFormData((prev) => ({ ...prev, [name]: selectedValues }));

//   const field = demographicFields.find((field) => field.name === name);
//   if (field && field.validate) {
//     const validationErrors = field.validate
//       .map((validate) => validate(selectedValues, formData))
//       .flat();
//     setErrors((prev) => ({ ...prev, [name]: validationErrors }));
//   } else {
//     setErrors((prev) => ({ ...prev, [name]: [] }));
//   }

//   setGlobalMessage(null);
// };
// /*   const handleMultiSelectChange = (selectedOptions: { value: string }[], name: string): void => {
//     const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
//     setFormData((prev) => ({ ...prev, [name]: values }));

//     const field = medicalInterviewFields.find((field) => field.name === name);
//     if (field && field.validate) {
//       const validationErrors = field.validate.map((validate) => validate(values, formData)).flat();
//       if (values.length > 0) {
//         setErrors((prev) => ({ ...prev, [name]: [] }));
//       } else {
//         setErrors((prev) => ({ ...prev, [name]: validationErrors }));
//       }
//     } else {
//       setErrors((prev) => ({ ...prev, [name]: [] }));
//     }
//     setGlobalMessage(null); // Clear global message on individual field change
//   }; */

//   const validateAllFields = (): boolean => {
//     const newErrors: ErrorData = {};
//     let hasErrors = false;

//     medicalInterviewFields.forEach((field) => {
//       const value = formData[field.name];
//       if (field.validate) {
//         const validationErrors = field.validate.map((validate) => validate(value, formData)).flat();
//         if (validationErrors.length > 0) {
//           newErrors[field.name] = validationErrors;
//           hasErrors = true;
//         }
//       }
//     });

//     if (formData.dob && formData.age) {
//       const ageComparisonErrors = compareAgeWithDOB(formData.dob as string, formData.age as number);
//       if (ageComparisonErrors.length > 0) {
//         newErrors.age = ageComparisonErrors;
//         hasErrors = true;
//       }
//     }

//     setErrors(newErrors);

//     return !hasErrors;
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
//     e.preventDefault();

//     if (!validateAllFields()) {
//       setGlobalMessage({ message: 'Please fill all missing fields.', type: 'error' });
//       return;
//     }

//     try {
//       const timestamp = new Date();
//       const localDateTime = timestamp.toLocaleString();
//       const formDataWithTimestamp = {
//         ...formData,
//         userId: currentUser?.uid || 'anonymous',
//         timestamp: timestamp.toISOString(),
//         localDateTime,
//       };

//       // Save to Firestore
//       const userDocRef = doc(collection(db, `users/${currentUser?.uid}/medical-interviews`));
//       await setDoc(userDocRef, formDataWithTimestamp);

//       // Generate CSV data
//       const csvData = Object.keys(formDataWithTimestamp)
//         .map((key) => {
//           const value = Array.isArray(formDataWithTimestamp[key])
//             ? (formDataWithTimestamp[key] as string[]).join(';')
//             : formDataWithTimestamp[key];
//           return `${key},${value}`;
//         })
//         .join('\n');

//       // Save CSV to Firebase Storage
//       const csvRef = ref(storage, `users/${currentUser?.uid}/medical-interviews/${timestamp.toISOString()}.csv`);
//       await uploadString(csvRef, csvData);

//       setGlobalMessage({ message: 'Data submitted successfully.', type: 'success' });
//       setTimeout(() => {
//         navigate('/thank-you', { state: { type: 'medical' } });
//       }, 2000); // Redirect after 2 seconds
//     } catch (err) {
//       console.error('Error submitting medical interviews:', err);
//       setGlobalMessage({ message: 'Error submitting data. Please try again.', type: 'error' });
//     }
//   };

//   return (
//     <Frame3 bgColor="bg-orange-100">
//       <h2 className="text-3xl font-bold mb-4 text-center">Medical Interview</h2>
//       <DateTimeDisplay />
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
//           {medicalInterviewFields.filter((field) => field.type !== 'textareascroll').map((field) => {
//             if (field.type === 'input') {
//               return (
//                 <InputField
//                   key={field.name}
//                   label={field.label}
//                   name={field.name}
//                   type={field.inputType}
//                   value={(formData[field.name] as string) || ''}
//                   onChange={handleChange}
//                   placeholder={field.placeholder}
//                   errors={errors[field.name]}
//                 />
//               );
//             } else if (field.type === 'autosizeinput') {
//               return (
//                 <AutosizeInputField
//                   key={field.name}
//                   label={field.label}
//                   name={field.name}
//                   value={(formData[field.name] as string) || ''}
//                   onChange={handleChange}
//                   placeholder={field.placeholder}
//                   errors={errors[field.name]}
//                 />
//               );
//             } else if (field.type === 'select') {
//               return (
//                 <SelectField
//                   key={field.name}
//                   label={field.label}
//                   name={field.name}
//                   value={(formData[field.name] as string) || ''}
//                   onChange={handleChange}
//                   options={field.options}
//                   errors={errors[field.name]}
//                 />
//               );
//             } else if (field.type === 'selectWithOther') {
//               return (
//                 <SelectWithOtherField
//                   key={field.name}
//                   label={field.label}
//                   name={field.name}
//                   value={(formData[field.name] as string) || ''}
//                   onChange={handleChange}
//                   options={field.options}
//                   errors={errors[field.name]}
//                 />
//               );
//             } else if (field.type === 'multiSelect') {
//               return (
//                 <MultiSelectField
//                   key={field.name}
//                   label={field.label}
//                   name={field.name}
//                   value={(formData[field.name] as string[]) || []}
//                   onChange={(selectedOptions) => handleMultiSelectChange(selectedOptions, field.name)}
//                   options={field.options}
//                   errors={errors[field.name]}
//                 />
//               );
//             } else if (field.type === 'multiSelectWithOther') {
//               return (
//                 <MultiSelectWithOtherField
//                   key={field.name}
//                   label={field.label}
//                   name={field.name}
//                   values={(formData[field.name] as string[]) || []}
//                   onChange={handleMultiSelectChange}
//                   options={field.options}
//                   errors={errors[field.name]}
//                 />
//               );
//             }
//             return null;
//           })}
//         </div>
//         <div className="mt-4">
//           <h3 className="text-xl font-bold mb-4">Additional Information</h3>
//           {medicalInterviewFields.filter((field) => field.type === 'textareascroll').map((field) => (
//             <TextAreaField
//               key={field.name}
//               label={field.label}
//               name={field.name}
//               value={(formData[field.name] as string) || ''}
//               onChange={handleChange}
//               errors={errors[field.name]}
//             />
//           ))}
//         </div>
//         {globalMessage && <Alert message={globalMessage.message} type={globalMessage.type} />}
//         <div className="flex justify-between items-center mt-4">
//           <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">
//             Submit
//           </Button>
//         </div>
//       </form>
//     </Frame3>
//   );
// };

// export default MedicalInterviewPage;

// //+++++++++++JS version+++++++++++++++++
// //src\components\pages\MedicalInterviewPage.jsx
//  // JS version
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { collection, doc, setDoc } from 'firebase/firestore';
// import { useAuth } from '../../data/AuthContext';
// import { db, storage } from '../../firebase/firebase';
// import InputField from '../common/InputField';
// import SelectField from '../common/SelectField';
// import SelectWithOtherField from '../common/SelectWithOtherField';
// import MultiSelectField from '../common/MultiSelectField';
// import TextAreaField from '../common/TextAreaField';
// import MultiSelectWithOtherField from '../common/MultiSelectWithOtherField';
// import AutosizeInputField from '../common/AutosizeInputField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';
// import DateTimeDisplay from '../common/DateTimeDisplay';
// import { medicalInterviewFields } from '../../data/medicalInterviewFields';
// import { ref, uploadString } from "firebase/storage";
// import {
//   validatePositiveNumber, validateEmail, validatePhoneNumber,
//   validateRequired, validateDOB, validateAge, compareAgeWithDOB
// } from '../../utils/validation';
// import { Frame3, Frame } from '../common/Frame';

// const MedicalInterviewPage = () => {
//   const navigate = useNavigate();
//   const { currentUser } = useAuth();
//   const [formData, setFormData] = useState({});
//   const [errors, setErrors] = useState({});
//   const [globalMessage, setGlobalMessage] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     const field = medicalInterviewFields.find((field) => field.name === name);
//     if (field && field.validate) {
//       const validationErrors = field.validate.map((validate) => validate(value, formData)).flat();
//       if (validationErrors.length === 0) {
//         setErrors((prev) => ({ ...prev, [name]: [] }));
//       } else {
//         setErrors((prev) => ({ ...prev, [name]: validationErrors }));
//       }
//     } else {
//       setErrors((prev) => ({ ...prev, [name]: [] }));
//     }
//     setGlobalMessage(''); // Clear global message on individual field change
//   };

//   const handleMultiSelectChange = (selectedOptions, name) => {
//     const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
//     setFormData((prev) => ({ ...prev, [name]: values }));

//     const field = medicalInterviewFields.find((field) => field.name === name);
//     if (field && field.validate) {
//       const validationErrors = field.validate.map((validate) => validate(values, formData)).flat();
//       if (values.length > 0) {
//         setErrors((prev) => ({ ...prev, [name]: [] }));
//       } else {
//         setErrors((prev) => ({ ...prev, [name]: validationErrors }));
//       }
//     } else {
//       setErrors((prev) => ({ ...prev, [name]: [] }));
//     }
//     setGlobalMessage(''); // Clear global message on individual field change
//   };

//   const validateAllFields = () => {
//     const newErrors = {};
//     let hasErrors = false;

//     medicalInterviewFields.forEach((field) => {
//       const value = formData[field.name];
//       if (field.validate) {
//         const validationErrors = field.validate.map((validate) => validate(value, formData)).flat();
//         if (validationErrors.length > 0) {
//           newErrors[field.name] = validationErrors;
//           hasErrors = true;
//         }
//       }
//     });

//     if (formData.dob && formData.age) {
//       const ageComparisonErrors = compareAgeWithDOB(formData.dob, formData.age);
//       if (ageComparisonErrors.length > 0) {
//         newErrors.age = ageComparisonErrors;
//         hasErrors = true;
//       }
//     }

//     setErrors(newErrors);

//     return !hasErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateAllFields()) {
//       setGlobalMessage({ message: 'Please fill all missing fields.', type: 'error' });
//       return;
//     }

//     try {
//       const timestamp = new Date();
//       const localDateTime = timestamp.toLocaleString();
//       const formDataWithTimestamp = {
//         ...formData,
//         userId: currentUser.uid,
//         timestamp: timestamp.toISOString(),
//         localDateTime: localDateTime
//       };

//       // Save to Firestore
//       const userDocRef = doc(collection(db, `users/${currentUser.uid}/medical-interviews`));
//       await setDoc(userDocRef, formDataWithTimestamp);
//       console.log('Document written with ID: ', userDocRef.id);

//       // Generate CSV data
//       const csvData = Object.keys(formDataWithTimestamp).map(key => {
//         const value = Array.isArray(formDataWithTimestamp[key])
//           ? formDataWithTimestamp[key].join(';')
//           : formDataWithTimestamp[key];
//         return `${key},${value}`;
//       }).join('\n');
      
//       // Save CSV to Firebase Storage
//       const csvRef = ref(storage, `users/${currentUser.uid}/medical-interviews/${timestamp.toISOString()}.csv`);
//       await uploadString(csvRef, csvData);

//       setGlobalMessage({ message: 'Data submitted successfully.', type: 'success' });
//       setTimeout(() => {
//         navigate('/thank-you', { state: { type: 'medical' } });
//       }, 2000); // Redirect after 2 seconds
//     } catch (err) {
//       console.error('Error submitting medical-interviews:', err);
//       setGlobalMessage({ message: 'Error submitting data. Please try again.', type: 'error' });
//     }
//   };

//   return (
//     <Frame3  bgColor="bg-orange-100">
//     {/* <div className="container  bg-orange-100 mx-auto p-4"> */}
       
//         <h2 className="text-3xl font-bold mb-4 text-center">Medical Interview</h2>
//         <DateTimeDisplay />
//         <form onSubmit={handleSubmit}>
//           <div className=" grid grid-cols-1 md:grid-cols-3 gap-24">
//             {medicalInterviewFields.filter(field => field.type !== 'textareascroll').map((field) => {
//               if (field.type === 'input') {
//                 return (
//                   <InputField
//                     key={field.name}
//                     label={field.label}
//                     name={field.name}
//                     type={field.inputType}
//                     value={formData[field.name] || ''}
//                     onChange={handleChange}
//                     placeholder={field.placeholder}
//                     errors={errors[field.name]}
//                   />
//                 );
//               } else if (field.type === 'autosizeinput') {
//                 return (
//                   <AutosizeInputField
//                     key={field.name}
//                     label={field.label}
//                     name={field.name}
//                     value={formData[field.name] || ''}
//                     onChange={handleChange}
//                     placeholder={field.placeholder}
//                     errors={errors[field.name]}
//                   />
//                 );
//               } else if (field.type === 'select') {
//                 return (
//                   <SelectField
//                     key={field.name}
//                     label={field.label}
//                     name={field.name}
//                     value={formData[field.name] || ''}
//                     onChange={handleChange}
//                     options={field.options}
//                     errors={errors[field.name]}
//                   />
//                 );
//               } else if (field.type === 'selectWithOther') {
//                 return (
//                   <SelectWithOtherField
//                     key={field.name}
//                     label={field.label}
//                     name={field.name}
//                     value={formData[field.name] || ''}
//                     onChange={handleChange}
//                     options={field.options}
//                     errors={errors[field.name]}
//                   />
//                 );
//               } else if (field.type === 'multiSelect') {
//                 return (
//                   <MultiSelectField
//                     key={field.name}
//                     label={field.label}
//                     name={field.name}
//                     value={formData[field.name] || []}
//                     onChange={(selectedOptions) => handleMultiSelectChange(selectedOptions, field.name)}
//                     options={field.options}
//                     errors={errors[field.name]}
//                   />
//                 );
//               } else if (field.type === 'multiSelectWithOther') {
//                 return (
//                   <MultiSelectWithOtherField
//                     key={field.name}
//                     label={field.label}
//                     name={field.name}
//                     values={formData[field.name] || []}
//                     onChange={handleMultiSelectChange}
//                     options={field.options}
//                     errors={errors[field.name]}
//                   />
//                 );
//               }
//               return null;
//             })}
//           </div>
//           <div className="mt-4">
//             <h3 className="text-xl font-bold mb-4">Additional Information</h3>
//             {medicalInterviewFields.filter(field => field.type === 'textareascroll').map((field) => (
//               <TextAreaField
//                 key={field.name}
//                 label={field.label}
//                 name={field.name}
//                 value={formData[field.name] || ''}
//                 onChange={handleChange}
//                 errors={errors[field.name]}
//               />
//             ))}
//           </div>
//           {globalMessage && <Alert message={globalMessage.message} type={globalMessage.type} />}
//           <div className="flex justify-between items-center mt-4">
//             <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Submit</Button>
//           </div>
//         </form>
       

//       </Frame3> );
// };

// export default MedicalInterviewPage;


/* // src/components/pages/MedicalInterviewPage.jsx
// last final working with multiselect fields .
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../data/AuthContext';
import { db, storage } from '../../firebase/firebase';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import SelectWithOtherField from '../common/SelectWithOtherField';
import MultiSelectField from '../common/MultiSelectField';
import TextAreaField from '../common/TextAreaField';
import MultiSelectWithOtherField from '../common/MultiSelectWithOtherField';
import AutosizeInputField from '../common/AutosizeInputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import DateTimeDisplay from '../common/DateTimeDisplay';
import { medicalInterviewFields } from '../../data/medicalInterviewFields';
import { ref, uploadString } from "firebase/storage";
import {
  validatePositiveNumber, validateEmail, validatePhoneNumber,
  validateRequired, validateDOB, validateAge, compareAgeWithDOB
} from '../../utils/validation';
import {Frame3,Frame} from '../common/Frame';
const MedicalInterviewPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const field = medicalInterviewFields.find((field) => field.name === name);
    if (field && field.validate) {
      const validationErrors = field.validate.map((validate) => validate(value, formData)).flat();
      if (validationErrors.length === 0) {
        setErrors((prev) => ({ ...prev, [name]: [] }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: validationErrors }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
    setGlobalMessage(''); // Clear global message on individual field change
  };

  const handleMultiSelectChange = (selectedOptions, name) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData((prev) => ({ ...prev, [name]: values }));

    const field = medicalInterviewFields.find((field) => field.name === name);
    if (field && field.validate) {
      const validationErrors = field.validate.map((validate) => validate(values, formData)).flat();
      if (values.length > 0) {
        setErrors((prev) => ({ ...prev, [name]: [] }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: validationErrors }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
    setGlobalMessage(''); // Clear global message on individual field change
  };

  const validateAllFields = () => {
    const newErrors = {};
    let hasErrors = false;

    medicalInterviewFields.forEach((field) => {
      const value = formData[field.name];
      if (field.validate) {
        const validationErrors = field.validate.map((validate) => validate(value, formData)).flat();
        if (validationErrors.length > 0) {
          newErrors[field.name] = validationErrors;
          hasErrors = true;
        }
      }
    });

    if (formData.dob && formData.age) {
      const ageComparisonErrors = compareAgeWithDOB(formData.dob, formData.age);
      if (ageComparisonErrors.length > 0) {
        newErrors.age = ageComparisonErrors;
        hasErrors = true;
      }
    }

    setErrors(newErrors);

    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      setGlobalMessage({ message: 'Please fill all missing fields.', type: 'error' });
      return;
    }

    try {
      const timestamp = new Date();
      const localDateTime = timestamp.toLocaleString();
      const formDataWithTimestamp = {
        ...formData,
        userId: currentUser.uid,
        timestamp: timestamp.toISOString(),
        localDateTime: localDateTime
      };

      // Save to Firestore
      const userDocRef = doc(collection(db, `users/${currentUser.uid}/medical-interviews`));
      await setDoc(userDocRef, formDataWithTimestamp);
      console.log('Document written with ID: ', userDocRef.id);

      // Generate CSV data
      const csvData = Object.keys(formDataWithTimestamp).map(key => {
        const value = Array.isArray(formDataWithTimestamp[key])
          ? formDataWithTimestamp[key].join(';')
          : formDataWithTimestamp[key];
        return `${key},${value}`;
      }).join('\n');
      
      // Save CSV to Firebase Storage
      const csvRef = ref(storage, `users/${currentUser.uid}/medical-interviews/${timestamp.toISOString()}.csv`);
      await uploadString(csvRef, csvData);

      setGlobalMessage({ message: 'Data submitted successfully.', type: 'success' });
      setTimeout(() => {
        navigate('/thank-you', { state: { type: 'medical-interviews' } });
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      console.error('Error submitting medical-interviews:', err);
      setGlobalMessage({ message: 'Error submitting data. Please try again.', type: 'error' });
    }
  };

  return (
    <Frame3>
    <div className="container mx-auto p-4">
       <h2 className="text-2xl font-bold mb-4 text-center">Medical interviews</h2>
       <DateTimeDisplay />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {medicalInterviewFields.map((field) => {
            if (field.type === 'input') {
              return (
                <InputField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.inputType}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  errors={errors[field.name]}
                />
              );
            } else if (field.type === 'textareascroll') {
              return (
                <TextAreaField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  errors={errors[field.name]}
                />
              );
            
            } else if (field.type === 'autosizeinput') {
              return (
                <AutosizeInputField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  value={formData[field.name] || ''}
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
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  options={field.options}
                  errors={errors[field.name]}
                />
              );
            } else if (field.type === 'selectWithOther') {
              return (
                <SelectWithOtherField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  options={field.options}
                  errors={errors[field.name]}
                />
              );
            } else if (field.type === 'multiSelect') {
              return (
                <MultiSelectField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  value={formData[field.name] || []}
                  onChange={(selectedOptions) => handleMultiSelectChange(selectedOptions, field.name)}
                  options={field.options}
                  errors={errors[field.name]}
                />
              );
            } else if (field.type === 'multiSelectWithOther') {
              return (
                <MultiSelectWithOtherField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  values={formData[field.name] || []}
                  onChange={handleMultiSelectChange}
                  options={field.options}
                  errors={errors[field.name]}
                />
              );
            }
            return null;
          })}
        </div>
        {globalMessage && <Alert message={globalMessage.message} type={globalMessage.type} />}
        <div className="flex ju/* stify-between items-center mt-100">
          {<Button type="submit" className="bg-blue-500 hover:bg-blue-700 border border-blue-700">Submit</Button> } 
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700 mt-4">Submit</Button>
        </div>
      </form>
    </div> 
 </Frame3> );
 
};

export default MedicalInterviewPage; */
