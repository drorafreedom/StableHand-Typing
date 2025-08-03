// src/components/pages/DemographicsPage.tsx

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
import { demographicFields, DemographicFields } from '../../data/demographicFields';
import { ref, uploadString } from 'firebase/storage';
import {
  validatePositiveNumber,
  validateEmail,
  validatePhoneNumber,
  validateRequired,
  validateDOB,
  validateAge,
  compareAgeWithDOB,
  validateMultiSelectField,
} from '../../utils/validation';
import { Frame3 } from '../common/Frame';

interface FormData {
  [key: string]: any;
}

const DemographicsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [globalMessage, setGlobalMessage] = useState<{ message: string; type: 'success' | 'error' | '' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const field = demographicFields.find((field) => field.name === name);
    if (field && field.validate) {
      const validationErrors = field.validate.map((validate) => validate(value, formData)).flat();
      setErrors((prev) => ({ ...prev, [name]: validationErrors }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
    setGlobalMessage(null);
  };

 const handleMultiSelectChange = (selectedValues: string[], name: string) => {
  setFormData((prev) => ({ ...prev, [name]: selectedValues }));

  const field = demographicFields.find((field) => field.name === name);
  if (field && field.validate) {
    const validationErrors = field.validate
      .map((validate) => validate(selectedValues, formData))
      .flat();
    setErrors((prev) => ({ ...prev, [name]: validationErrors }));
  } else {
    setErrors((prev) => ({ ...prev, [name]: [] }));
  }

  setGlobalMessage(null);
};


  const validateAllFields = (): boolean => {
    const newErrors: { [key: string]: string[] } = {};
    let hasErrors = false;

    demographicFields.forEach((field) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        userId: currentUser?.uid,
        timestamp: timestamp.toISOString(),
        localDateTime: localDateTime,
      };

      const userDocRef = doc(collection(db, `users/${currentUser?.uid}/demographics`));
      await setDoc(userDocRef, formDataWithTimestamp);

      const csvData = Object.entries(formDataWithTimestamp)
        .map(([key, value]) =>
          Array.isArray(value) ? `${key},"${value.join(';')}"` : `${key},${value}`
        )
        .join('\n');

      const csvRef = ref(storage, `users/${currentUser?.uid}/demographics/${timestamp.toISOString()}.csv`);
      await uploadString(csvRef, csvData);

      setGlobalMessage({ message: 'Data submitted successfully.', type: 'success' });
      setTimeout(() => navigate('/thank-you', { state: { type: 'demographics' } }), 2000);
    } catch (err) {
      console.error('Error submitting demographics:', err);
      setGlobalMessage({ message: 'Error submitting data. Please try again.', type: 'error' });
    }
  };

  return (
    <Frame3 bgColor="bg-yellow-100" paddingX="px-4" marginX="mx-2">
      <h2 className="text-3xl font-bold mb-4 text-center">Demographics Information</h2>
      <DateTimeDisplay />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demographicFields.map((field) => {
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
  value={formData[field.name] || []}  // still using string[]
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
  onChange={(selectedOptions) => handleMultiSelectChange(selectedOptions, field.name)}
  options={field.options}
  errors={errors[field.name]}
/>

              );
            }
            return null;
          })}
        </div>
        {globalMessage && <Alert message={globalMessage.message} type={globalMessage.type} />}
        <div className="flex justify-between items-center mt-6">
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">
            Submit
          </Button>
        </div>
      </form>
    </Frame3>
  );
};

export default DemographicsPage;



//+++++++++++JS version+++++++++++++++++
// src/components/pages/DemographicsPage.jsx
 // JS version
// last final working with multiselect fields .
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
// import { demographicFields } from '../../data/demographicFields';
// import { ref, uploadString } from "firebase/storage";
// import {
//   validatePositiveNumber, validateEmail, validatePhoneNumber,
//   validateRequired, validateDOB, validateAge, compareAgeWithDOB
// } from '../../utils/validation';
// import {Frame3,Frame} from '../common/Frame';
// const DemographicsPage = () => {
//   const navigate = useNavigate();
//   const { currentUser } = useAuth();
//   const [formData, setFormData] = useState({});
//   const [errors, setErrors] = useState({});
//   const [globalMessage, setGlobalMessage] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     const field = demographicFields.find((field) => field.name === name);
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

//     const field = demographicFields.find((field) => field.name === name);
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

//     demographicFields.forEach((field) => {
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
//       const userDocRef = doc(collection(db, `users/${currentUser.uid}/demographics`));
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
//       const csvRef = ref(storage, `users/${currentUser.uid}/demographics/${timestamp.toISOString()}.csv`);
//       await uploadString(csvRef, csvData);

//       setGlobalMessage({ message: 'Data submitted successfully.', type: 'success' });
//       setTimeout(() => {
//         navigate('/thank-you', { state: { type: 'demographics' } });
//       }, 2000); // Redirect after 2 seconds
//     } catch (err) {
//       console.error('Error submitting demographics:', err);
//       setGlobalMessage({ message: 'Error submitting data. Please try again.', type: 'error' });
//     }
//   };

//   return (
//     <Frame3 bgColor="bg-yellow-100"
    
//       paddingX="px-1006"         // Increase horizontal padding
//       marginX="mx-800"           // Add margin on both sides
//       >
//        <h2 className="text-3xl font-bold mb-4 text-center">Demographics Information</h2>
//        <DateTimeDisplay />
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
//           {demographicFields.map((field) => {
//             if (field.type === 'input') {
//               return (
//                 <InputField
//                   key={field.name}
//                   label={field.label}
//                   name={field.name}
//                   type={field.inputType}
//                   value={formData[field.name] || ''}
//                   onChange={handleChange}
//                   placeholder={field.placeholder}
//                   errors={errors[field.name]}
//                 />
//               );
//             } else if (field.type === 'textareascroll') {
//               return (
//                 <TextAreaField
//                   key={field.name}
//                   label={field.label}
//                   name={field.name}
//                   value={formData[field.name] || ''}
//                   onChange={handleChange}
//                   errors={errors[field.name]}
//                 />
//               );
            
//             } else if (field.type === 'autosizeinput') {
//               return (
//                 <AutosizeInputField
//                   key={field.name}
//                   label={field.label}
//                   name={field.name}
//                   value={formData[field.name] || ''}
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
//                   value={formData[field.name] || ''}
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
//                   value={formData[field.name] || ''}
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
//                   value={formData[field.name] || []}
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
//                   values={formData[field.name] || []}
//                   onChange={handleMultiSelectChange}
//                   options={field.options}
//                   errors={errors[field.name]}
//                 />
//               );
//             }
//             return null;
//           })}
//         </div>
//         {globalMessage && <Alert message={globalMessage.message} type={globalMessage.type} />}
//         <div className="flex justify-between items-center mt-100">
//           {/* <Button type="submit" className="bg-blue-500 hover:bg-blue-700 border border-blue-700">Submit</Button> */}
//           <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700 mt-4">Submit</Button>
//         </div>
//       </form>
    
//     </Frame3>);
 
// };

// export default DemographicsPage;
