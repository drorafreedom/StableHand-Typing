 

 

//the last version 
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Welcome from './components/pages/Welcome';
import LoginPage from './components/pages/LoginPage';
import RegistrationPage from './components/pages/RegistrationPage';
import ResetPasswordPage from './components/pages/ResetPasswordPage';
import LogoutPage from './components/pages/LogoutPage';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import ThankYouPage from './components/pages/ThankYouPage';
import StablehandWelcomePage from './components/pages/StablehandWelcomePage';
import ContactUsPage from './components/pages/ContactUsPage';
import BackgroundPage from './components/pages/BackgroundPage';
import DemographicsPage from './components/pages/DemographicsPage';
import MedicalInterviewPage from './components/pages/MedicalInterviewPage';
import ParkinsonsInterviewPage from './components/pages/ParkinsonsInterviewPage';
import SettingPage from './components/pages/SettingPage';
import AccountPage from './components/pages/AccountPage';
import ProgressNotesPage from './components/pages/ProgressNotesPage';
import TherapyPage from './components/pages/TherapyPage';
//import TherapyPage2 from './components/Therapy/TherapyPage2.jsx'; // Import TherapyPage2
import DisclaimerPage from './components/pages/DisclaimerPage';
import { AuthProvider } from './data/AuthContext';
import { Frame2, Frame3,Frame4, Frame5,Frame6,Frame } from './components/common/Frame';
import MultifunctionAnimation from './components/Therapy/MultifunctionAnimation.jsx';
import ShapeAnimations from './components/Therapy/ShapeAnimations.jsx';
import AnimationBackground from './components/Therapy/AnimationBackground';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import DataDeletionInstructions from './components/pages/DataDeletionInstructionsPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import ErrorBoundary from './components/common/ErrorBoundary'; // Import ErrorBoundary

const App = () => {
  const location = useLocation();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  
  const isTherapyPage = location.pathname === '/therapy';

  useEffect(() => {
    const visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];
    if (!visitedPages.includes(location.pathname)) {
      visitedPages.push(location.pathname);
      localStorage.setItem('visitedPages', JSON.stringify(visitedPages));
    }
  }, [location]);

  const toggleSidebar = () => {
    setSidebarVisible(prevState => !prevState);
  };

  return (
   
      <div className="flex flex-col min-h-screen">
        <Sidebar isVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
        {!isTherapyPage && <Header toggleSidebar={toggleSidebar} />}
        <div className={`flex flex-col flex-grow w-full p-4 ${isSidebarVisible ? 'ml-0' : 'ml-0'}`}>
          <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/logout" element={<LogoutPage />} />
              <Route path="/stablehand-welcome" element={<StablehandWelcomePage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
               
              <Route path="/background" element={<BackgroundPage />} />
              <Route path="/demographics" element={<DemographicsPage />} />
              <Route path="/medical-interview" element={<MedicalInterviewPage />} />
              <Route path="/parkinson-interview" element={<ParkinsonsInterviewPage />} />
              <Route path="/therapy" element={<TherapyPage />} />
              <Route path="/progress-notes" element={<ProgressNotesPage />} />
              <Route path="/setting" element={<SettingPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/multifuncion-animation" element={<MultifunctionAnimation />} />
              <Route path="/shape-animation" element={<ShapeAnimations />} />
              <Route path="/backGround-animation" element={<AnimationBackground />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/data-deletion-instructions" element={<DataDeletionInstructions />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              {/* AnimationBackground */}
            </Routes>
          </div>
       
        {!isTherapyPage && <Footer />}
      </div>
   
    
  );
};

const AppWrapper = () => (
  <ErrorBoundary>
  <Router  >
    <App />
  </Router>
  </ErrorBoundary>
);

export default AppWrapper;   



