// src/components/pages/DemographicsPage.jsx
// last final working with multiselect fields .
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../data/AuthContext';
import { db, storage } from '../../../firebase/firebase';
import InputField from '../../common/InputField';
import SelectField from '../../common/SelectField';
import SelectWithOtherField from '../../common/SelectWithOtherField';
import MultiSelectField from '../../common/MultiSelectField';
import Button from '../../common/Button';
import Alert from '../../common/Alert';
import DateTimeDisplay from '../../common/DateTimeDisplay';
import { demographicFields } from '../../../data/demographicFields';
import { ref, uploadString } from "firebase/storage";
import {
  validatePositiveNumber, validateEmail, validatePhoneNumber,
  validateRequired, validateDOB, validateAge, compareAgeWithDOB
} from '../../../utils/validation';
import {Frame3,Frame} from '../../common/Frame';
const DemographicsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const field = demographicFields.find((field) => field.name === name);
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

    const field = demographicFields.find((field) => field.name === name);
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
      const userDocRef = doc(collection(db, `users/${currentUser.uid}/demographics`));
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
      const csvRef = ref(storage, `users/${currentUser.uid}/demographics/${timestamp.toISOString()}.csv`);
      await uploadString(csvRef, csvData);

      setGlobalMessage({ message: 'Data submitted successfully.', type: 'success' });
      setTimeout(() => {
        navigate('/thank-you', { state: { type: 'demographics' } });
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      console.error('Error submitting demographics:', err);
      setGlobalMessage({ message: 'Error submitting data. Please try again.', type: 'error' });
    }
  };

  return (
    <Frame3>
    <div className="container mx-auto p-4">
       <h2 className="text-2xl font-bold mb-4 text-center">Demographics Information</h2>
       <DateTimeDisplay />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            }
            return null;
          })}
        </div>
        {globalMessage && <Alert message={globalMessage.message} type={globalMessage.type} />}
        <div className="flex justify-between items-center mt-100">
          {/* <Button type="submit" className="bg-blue-500 hover:bg-blue-700 border border-blue-700">Submit</Button> */}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700 mt-4">Submit</Button>
        </div>
      </form>
    </div> 
 </Frame3> );
 
};

export default DemographicsPage;
