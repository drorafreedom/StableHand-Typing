// src/components/pages/DemographicsPage.jsx

// src/components/pages/DemographicsPage.jsx
//this is based on FOrm Field a combination of bot hinput and select fields used before 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../../common/FormField';
import Button from '../../common/Button';
import Alert from '../../common/Alert';
import { db } from '../../../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { validateEmail, validatePhoneNumber } from '../../../utils/validation';

const DemographicsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    gender: '',
    ethnicity: '',
    income: '',
    employmentStatus: '',
    educationLevel: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phoneNumber: '',
    email: '',
    countryOfBirth: '',
    citizenship: '',
    languages: '',
    profession: '',
    maritalStatus: '',
    naturalKids: '',
    adoptedKids: '',
    pets: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    switch (name) {
      case 'email':
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        break;
      case 'phoneNumber':
        setErrors((prev) => ({ ...prev, phoneNumber: validatePhoneNumber(value) }));
        break;
      default:
        setErrors((prev) => ({ ...prev, [name]: value.length === 0 ? 'This field is required' : '' }));
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ message: '', type: '' });
    const validationErrors = Object.values(errors).flat();
    if (validationErrors.every((err) => err === '')) {
      try {
        await addDoc(collection(db, 'demographics'), formData);
        setMessage({ message: 'Data submitted successfully!', type: 'success' });
        navigate('/thank-you');
      } catch (error) {
        setMessage({ message: `Error submitting data: ${error.message}`, type: 'error' });
      }
    } else {
      setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    }
  };

  const genderOptions = ['Male', 'Female', 'Other'];
  const ethnicityOptions = ['White', 'Black', 'Asian', 'Hispanic', 'Other'];
  const incomeOptions = ['<20,000', '20,000-50,000', '50,000-100,000', '100,000+'];
  const employmentStatusOptions = ['Employed', 'Unemployed', 'Retired', 'Self-Employed'];
  const educationLevelOptions = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate'];
  const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Demographics Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            errors={[errors.firstName]}
          />
          <FormField
            label="Middle Name"
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            placeholder="Enter middle name"
            errors={[errors.middleName]}
          />
          <FormField
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            errors={[errors.lastName]}
          />
          <FormField
            label="Date of Birth"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            errors={[errors.dob]}
          />
          <FormField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={genderOptions}
            errors={[errors.gender]}
          />
          <FormField
            label="Ethnicity"
            name="ethnicity"
            value={formData.ethnicity}
            onChange={handleChange}
            options={ethnicityOptions}
            errors={[errors.ethnicity]}
          />
          <FormField
            label="Income"
            name="income"
            value={formData.income}
            onChange={handleChange}
            options={incomeOptions}
            errors={[errors.income]}
          />
          <FormField
            label="Employment Status"
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleChange}
            options={employmentStatusOptions}
            errors={[errors.employmentStatus]}
          />
          <FormField
            label="Education Level"
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            options={educationLevelOptions}
            errors={[errors.educationLevel]}
          />
          <FormField
            label="Address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
            errors={[errors.address]}
          />
          <FormField
            label="City"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter city"
            errors={[errors.city]}
          />
          <FormField
            label="State"
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter state"
            errors={[errors.state]}
          />
          <FormField
            label="Zip"
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            placeholder="Enter zip code"
            errors={[errors.zip]}
          />
          <FormField
            label="Country"
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter country"
            errors={[errors.country]}
          />
          <FormField
            label="Phone Number"
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
            errors={[errors.phoneNumber]}
          />
          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            errors={[errors.email]}
          />
          <FormField
            label="Country of Birth"
            type="text"
            name="countryOfBirth"
            value={formData.countryOfBirth}
            onChange={handleChange}
            placeholder="Enter country of birth"
            errors={[errors.countryOfBirth]}
          />
          <FormField
            label="Citizenship"
            type="text"
            name="citizenship"
            value={formData.citizenship}
            onChange={handleChange}
            placeholder="Enter citizenship"
            errors={[errors.citizenship]}
          />
          <FormField
            label="Languages"
            type="text"
            name="languages"
            value={formData.languages}
            onChange={handleChange}
            placeholder="Enter languages"
            errors={[errors.languages]}
          />
          <FormField
            label="Profession"
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            placeholder="Enter profession"
            errors={[errors.profession]}
          />
          <FormField
            label="Marital Status"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            options={maritalStatusOptions}
            errors={[errors.maritalStatus]}
          />
          <FormField
            label="Natural Kids"
            type="number"
            name="naturalKids"
            value={formData.naturalKids}
            onChange={handleChange}
            placeholder="Enter number of natural kids"
            errors={[errors.naturalKids]}
          />
          <FormField
            label="Adopted Kids"
            type="number"
            name="adoptedKids"
            value={formData.adoptedKids}
            onChange={handleChange}
            placeholder="Enter number of adopted kids"
            errors={[errors.adoptedKids]}
          />
          <FormField
            label="Pets"
            type="number"
            name="pets"
            value={formData.pets}
            onChange={handleChange}
            placeholder="Enter number of pets"
            errors={[errors.pets]}
          />
        </div>
        {message.message && <Alert message={message.message} type={message.type} />}
        <Button type="submit" className="mt-4 w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Submit</Button>
      </form>
    </div>
  );
};

export default DemographicsPage;




