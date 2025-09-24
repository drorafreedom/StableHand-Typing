
// src/components/pages/StablehandWelcomePage.tsx
// src/components/pages/StablehandWelcomePage.tsx

// src/components/pages/StablehandWelcomePage.tsx
//-------------04.20.25 - 
// Phone‑only users (providerId === 'phone') never get shown MfaEnrollment.

// Email+password users (providerId === 'password') only see MfaEnrollment if they have zero enrolled factors (enrolledFactors.length === 0).

// Accounts that share the same phone number but signed in with email+password and already did MFA won’t see the prompt again because hasAnyMfa is true.
//---------------------------------------------------
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame, Frame3 } from '../common/Frame';
import MfaEnrollment from '../common/MfaEnrollment';
import { getAuth, multiFactor, User } from 'firebase/auth';

const StablehandWelcomePage: React.FC = () => {
  const [needsMfaEnrollment, setNeedsMfaEnrollment] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user: User | null = auth.currentUser;
    if (!user) return;

    // What methods this user signed in with:
    const providerIds = user.providerData.map(pd => pd.providerId);
    const usedEmailPassword = providerIds.includes('password');
    const usedPhoneSignIn   = providerIds.includes('phone');

    // Does this user already have ANY MFA factors enrolled?
    const hasAnyMfa = multiFactor(user).enrolledFactors.length > 0;

    // Only prompt if they came in via email/password, and have no MFA yet.
    if (usedEmailPassword && !hasAnyMfa) {
      setNeedsMfaEnrollment(true);
    }
    // Otherwise, skip the enrollment prompt entirely.
  }, []);

  return (
    <Frame3>
      <Frame>
        <h1 className="text-4xl font-bold mb-6">
          Welcome to StableHand's Dashboard
        </h1>

        {needsMfaEnrollment ? (
          <MfaEnrollment onEnrollmentComplete={() => setNeedsMfaEnrollment(false)} />
        ) : (
          <div className="flex flex-col space-y-4">
          <Link to="/disclaimer" className="w-full bg-blue-500 hover:bg-blue-700 text-white p-2 rounded">Disclaimer</Link>
          <Link to="/background" className="w-full bg-teal-500 hover:bg-green-700 text-white p-2 rounded">Background</Link>
          <Link to="/enduserguide" className="w-full bg-green-500 hover:bg-green-700 text-white p-2 rounded">End User Guide</Link>
          <Link to="/demographics" className="w-full bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded">Demographics</Link>
          <Link to="/medical-interview" className="w-full bg-orange-500 hover:bg-orange-700 text-white p-2 rounded">Medical Interview</Link>
          <Link to="/parkinson-interview" className="w-full bg-red-500 hover:bg-red-700 text-white p-2 rounded">Parkinson Interview (PDQ-39)</Link>
          <Link to="/therapy" className="w-full bg-purple-500 hover:bg-purple-700 text-white p-2 rounded">Therapy</Link>
          {/* <Link to="/progress-notes" className="w-full bg-gray-500 hover:bg-gray-700 text-white p-2 rounded">Progress Notes</Link> */}
          <Link to="/feedbackandprogress-notes" className="w-full bg-orange-500 hover:bg-gray-700 text-white p-2 rounded">FeedBack & Progress Notes</Link>
          <Link to="/therapyfeedback-notes" className="w-full bg-pink-500 hover:bg-gray-700 text-white p-2 rounded">Therapy FeedBack Notes</Link>
  
               
        </div>
        )}
      </Frame>
    </Frame3>
  );
};

export default StablehandWelcomePage;




/* import React, { useEffect, useState } from 'react';
/// fix to by pass MFA when only phone is login ( it is not enrolled in MFA ) 
import { Link } from 'react-router-dom';
import { Frame2, Frame, Frame3 } from '../common/Frame';
import MfaEnrollment from '../common/MfaEnrollment';
import { getAuth, multiFactor, User } from 'firebase/auth';

const StablehandWelcomePage: React.FC = () => {
  const [needsMfaEnrollment, setNeedsMfaEnrollment] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    const user: User | null = auth.currentUser;

    if (!user) return;

    // 1️⃣ See which providers this user signed in with:
    const providerIds = user.providerData.map(pd => pd.providerId);

    // 2️⃣ If they signed in with phoneAuthProvider directly, skip MFA prompt:
    const hasPhoneProvider = providerIds.includes('phone');

    // 3️⃣ Otherwise, if they used email/password and no 2FA is enrolled, prompt them:
    if (
      !hasPhoneProvider &&
      providerIds.includes('password') &&
      multiFactor(user).enrolledFactors.length === 0
    ) {
      setNeedsMfaEnrollment(true);
    }
  }, []);

  return (
    <Frame3>
      <Frame>
        <h1 className="text-4xl font-bold mb-6">
          Welcome to StableHand Clinical Trial Dashboard
        </h1>

        {needsMfaEnrollment ? (
          <MfaEnrollment onEnrollmentComplete={() => setNeedsMfaEnrollment(false)} />
        ) : (
          <div className="flex flex-col space-y-4">
          <Link to="/disclaimer" className="w-full bg-blue-500 hover:bg-blue-700 text-white p-2 rounded">Disclaimer</Link>
          <Link to="/background" className="w-full bg-green-500 hover:bg-green-700 text-white p-2 rounded">Background</Link>
          <Link to="/demographics" className="w-full bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded">Demographics</Link>
          <Link to="/medical-interview" className="w-full bg-orange-500 hover:bg-orange-700 text-white p-2 rounded">Medical Interview</Link>
          <Link to="/parkinson-interview" className="w-full bg-red-500 hover:bg-red-700 text-white p-2 rounded">Parkinson Interview (PDQ-39)</Link>
          <Link to="/therapy" className="w-full bg-purple-500 hover:bg-purple-700 text-white p-2 rounded">Therapy</Link>
          <Link to="/progress-notes" className="w-full bg-gray-500 hover:bg-gray-700 text-white p-2 rounded">Progress Notes</Link>
        </div>
        )}
      </Frame>
    </Frame3>
  );
};

export default StablehandWelcomePage; */


//--------------------TTSx full MFA enrollement  9including phone which doesnt work ------------------

/* import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame, Frame3 } from '../common/Frame';
import MfaEnrollment from '../common/MfaEnrollment'; // Adjust the import path as necessary
import { getAuth, multiFactor, User } from 'firebase/auth';

const StablehandWelcomePage: React.FC = () => {
  const [needsMfaEnrollment, setNeedsMfaEnrollment] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    const user: User | null = auth.currentUser;

    if (user) {
      // Check if user is enrolled in MFA
      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length === 0) {
        setNeedsMfaEnrollment(true); // Prompt for MFA enrollment if not set up
      }
    }
  }, []);

  return (
    <Frame3>
      <Frame>
        <h1 className="text-4xl font-bold mb-6">Welcome to StableHand Clinical Trial Dashboard</h1>
        {needsMfaEnrollment ? (
          <MfaEnrollment />
        ) : (
          <div className="flex flex-col space-y-4">
            <Link to="/disclaimer" className="w-full bg-blue-500 hover:bg-blue-700 text-white p-2 rounded">
              Disclaimer
            </Link>
            <Link to="/background" className="w-full bg-green-500 hover:bg-green-700 text-white p-2 rounded">
              Background
            </Link>
            <Link to="/demographics" className="w-full bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded">
              Demographics
            </Link>
            <Link to="/medical-interview" className="w-full bg-orange-500 hover:bg-orange-700 text-white p-2 rounded">
              Medical Interview
            </Link>
            <Link
              to="/parkinson-interview"
              className="w-full bg-red-500 hover:bg-red-700 text-white p-2 rounded"
            >
              Parkinson Interview (PDQ-39)
            </Link>
            <Link to="/therapy" className="w-full bg-purple-500 hover:bg-purple-700 text-white p-2 rounded">
              Therapy
            </Link>
            <Link to="/progress-notes" className="w-full bg-gray-500 hover:bg-gray-700 text-white p-2 rounded">
              Progress Notes
            </Link>
          </div>
        )}
      </Frame>
    </Frame3>
  );
};

export default StablehandWelcomePage; */


//+++++++++++JS version+++++++++++++++++
// src/components/pages/StablehandWelcomePage.jsx
 // JS version
//for MFA implementation 
/* import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame, Frame3 } from '../common/Frame';
import MfaEnrollment from '../common/MfaEnrollment'; // Adjust the import path as necessary
import { getAuth, multiFactor } from 'firebase/auth';

const StablehandWelcomePage = () => {
  const [needsMfaEnrollment, setNeedsMfaEnrollment] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // Check if user is enrolled in MFA
      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length === 0) {
        setNeedsMfaEnrollment(true); // Prompt for MFA enrollment if not set up
      }
    }
  }, []);

  return (
    <Frame3>
      <Frame>
        <h1 className="text-4xl font-bold mb-6">Welcome to StableHand Clinical Trial Dashboard</h1>
        {needsMfaEnrollment ? (
          <MfaEnrollment />
        ) : (
          <div className="flex flex-col space-y-4">
            <Link to="/disclaimer" className="w-full bg-blue-500 hover:bg-blue-700 text-white p-2 rounded">Disclaimer</Link>
            <Link to="/background" className="w-full bg-green-500 hover:bg-green-700 text-white p-2 rounded">Background</Link>
            <Link to="/demographics" className="w-full bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded">Demographics</Link>
            <Link to="/medical-interview" className="w-full bg-orange-500 hover:bg-orange-700 text-white p-2 rounded">Medical Interview</Link>
            <Link to="/parkinson-interview" className="w-full bg-red-500 hover:bg-red-700 text-white p-2 rounded">Parkinson Interview (PDQ-39)</Link>
            <Link to="/therapy" className="w-full bg-purple-500 hover:bg-purple-700 text-white p-2 rounded">Therapy</Link>
            <Link to="/progress-notes" className="w-full bg-gray-500 hover:bg-gray-700 text-white p-2 rounded">Progress Notes</Link>
          </div>
        )}
      </Frame>
    </Frame3>
  );
};

export default StablehandWelcomePage;
 */

//--------------------------------------------------
/* import React from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame,Frame3 } from '../common/Frame';
const StablehandWelcomePage = () => {
  return ( 
      <Frame3> <Frame> 
    
      <h1 className="text-4xl font-bold mb-6">Welcome to StableHand Clinical Trial Dashboard</h1>
      <div className="flex flex-col space-y-4">
      <Link to="/disclaimer" className="w-full bg-blue-500 hover:bg-blue-700 text-white p-2 rounded">Disclaimer</Link>
        <Link to="/background" className=" w-full bg-green-500 hover:bg-green-700   text-white p-2 rounded">Background</Link>
        <Link to="/demographics" className="w-full bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded">Demographics</Link>
        <Link to="/medical-interview" className="w-full bg-orange-500 hover:bg-orange-700 text-white p-2 rounded">Medical Interview</Link>
        <Link to="/parkinson-interview" className="w-full bg-red-500 hover:bg-red-700 text-white p-2 rounded">Parkinson Interview (PDQ-39)</Link>
        <Link to="/therapy" className="w-full bg-purple-500 hover:bg-purple-700 text-white p-2 rounded">Therapy</Link>
         <Link to="/progress-notes" className="w-full bg-gray-500 hover:bg-purple-gray text-white p-2 rounded">Progress Notes</Link>
       
    </div>
    </Frame></Frame3>
    
 );
};

export default StablehandWelcomePage;
 */

 
