// src/components/common/Sidebar.tsx
// TS version

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import caltechLogo from '../../assets/logos/caltech_logo.png';
import caltechLogo2 from '../../assets/logos/caltechlogo2.png';

// Define types for menu items and submenus
interface SubMenuItem {
  id: number;
  path: string;
  label: string;
}

interface MenuItem {
  id: number;
  path?: string; // Top-level menu items may or may not have a path
  label?: string; // Top-level menu items may or may not have a label
  submenu?: SubMenuItem[]; // Submenu items (optional)
}

interface SidebarProps {
  isVisible: boolean; // Indicates if the sidebar is visible
  toggleSidebar: (visible: boolean) => void; // Callback to toggle sidebar visibility
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, toggleSidebar }) => {
  const location = useLocation();

  // Fetch visited pages from localStorage
  const visitedPages: string[] = JSON.parse(localStorage.getItem('visitedPages') || '[]');

  // Define menu items with submenu structure
  const menuItems: MenuItem[] = [
    {
      id: 1,
      path: '/',
      label: 'Welcome',
      submenu: [
        { id: 2, path: '/login', label: 'Login' },
        { id: 3, path: '/register', label: 'Register' },
        { id: 4, path: '/reset-password', label: 'Reset Password' },
        { id: 5, path: '/logout', label: 'Logout' },
      ],
    },
    {
      id: 6,
      path: '/stablehand-welcome',
      label: 'Welcome to Stablehand',
      submenu: [
        { id: 7, path: '/disclaimer', label: 'Disclaimer' },
        { id: 8, path: '/background', label: 'Background' },
        { id: 23, path: '/enduserguide', label: 'EndUser Guide' },
        { id: 9, path: '/demographics', label: 'Demographics' },
        { id: 10, path: '/medical-interview', label: 'Medical Interview' },
        { id: 11, path: '/parkinson-interview', label: 'Parkinson Interview' },
        { id: 12, path: '/therapy', label: 'Therapy' },
        // { id: 13, path: '/progress-notes', label: 'Progress Notes' },
        { id: 13, path: '/feedbackandprogress-notes', label: 'FeedBack & Progress Notes' },
        { id: 14, path: '/therapyfeedback-notes', label: 'Therapy FeedBack Notes' },
      ],
    },
    {
      id: 15,
      submenu: [
        { id: 16, path: '/privacy-policy', label: 'Privacy Policy' },
        { id: 17, path: '/data-deletion-instructions', label: 'Data Deletion' },
        { id: 18, path: '/terms-of-service', label: 'Terms Of Service' },
      ],
    },
    {
      id: 19,
      submenu: [
        { id: 20, path: '/setting', label: 'Setting' },
        { id: 21, path: '/account', label: 'Account' },
        { id: 22, path: '/contact', label: 'Contact Us' },
        { id: 23, path: '/logout', label: 'Logout' },
      ],
    },
  ];

  // Handlers for mouse enter and leave events
  const handleMouseEnter = () => toggleSidebar(true);
  const handleMouseLeave = () => toggleSidebar(false);

  return (
    <>
      {/* Invisible trigger area to show the sidebar */}
      <div
        className="fixed top-0 left-0 h-full bg-transparent w-2 z-50"
        onMouseEnter={handleMouseEnter}
      />
      {/* Sidebar container */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-500 shadow-lg transition-transform transform ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        } w-52 pt-16 z-50 rounded-lg`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4 flex flex-col justify-between h-full overflow-y-auto bg-gray-500 shadow-lg rounded-md border border-gray-300">
          {/* Menu items */}
          <div>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  className={`mb-2 ${
                    visitedPages.includes(item.path || '') || location.pathname === item.path
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}
                >
                  {item.submenu ? (
                    <div className="p-2 rounded hover:bg-gray-200">
                      {item.path && (
                        <Link to={item.path} className="block p-2 rounded hover:bg-gray-200">
                          {item.label}
                        </Link>
                      )}
                      <ul className="ml-2 mt-2 bg-gray-500 rounded-lg border border-gray-300">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.id} className="mb-2">
                            <Link
                              to={subitem.path}
                              className={`block p-2 rounded hover:bg-red-200 ${
                                location.pathname === subitem.path
                                  ? 'text-black-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              {subitem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    item.path && (
                      <Link
                        to={item.path}
                        className={`block p-2 rounded hover:bg-red-200 ${
                          location.pathname === item.path ? 'text-black-500' : 'text-gray-400'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer with logos */}
          <div className="p-4 bg-gray-500 shadow-lg rounded-md border border-gray-300">
            <img src={caltechLogo2} alt="Caltech Logo 2" className="w-18 h-18 mb-2" />
            <img src={caltechLogo} alt="Caltech Logo" className="w-18 h-18 mb-2" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;



//==JS VERSIon===============
/* 
//src\components\common\Sidebar.Jsx

//JS version
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import caltechLogo from '../../assets/logos/caltech_logo.png';
import caltechLogo2 from '../../assets/logos/caltechlogo2.png';

const Sidebar = ({ isVisible, toggleSidebar }) => {
  const location = useLocation();
  const visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];

  const menuItems = [
    {
      id: 1, // Top-level menu item
      path: '/',
      label: 'Welcome',
      submenu: [
        { id: 2, path: '/login', label: 'Login' },
        { id: 3, path: '/register', label: 'Register' },
        { id: 4, path: '/reset-password', label: 'Reset Password' },
        { id: 5, path: '/logout', label: 'Logout' },
      ],
    },
    {
      id: 6, // Top-level menu item
      path: '/stablehand-welcome',
      label: 'Welcome to Stablehand',
      submenu: [
        { id: 7, path: '/disclaimer', label: 'Disclaimer' },
        { id: 8, path: '/background', label: 'Background' },
        { id: 9, path: '/demographics', label: 'Demographics' },
        { id: 10, path: '/medical-interview', label: 'Medical Interview' },
        { id: 11, path: '/parkinson-interview', label: 'Parkinson Interview' },
        { id: 12, path: '/therapy', label: 'Therapy' },
        { id: 13, path: '/progress-notes', label: 'Progress Notes' },
      ],
    },
    {
      id: 14, // Top-level menu item
      submenu: [
        { id: 15, path: '/privacy-policy', label: 'Privacy Policy' },
        { id: 16, path: '/data-deletion-instructions', label: 'Data Deletion' },
        { id: 17, path: '/terms-of-service', label: 'Terms Of Service' },
      ],
    },
    {
      id: 18, // Top-level menu item
      submenu: [
        { id: 19, path: '/setting', label: 'Setting' },
        { id: 20, path: '/account', label: 'Account' },
        { id: 21, path: '/contact', label: 'Contact Us' },
        { id: 22, path: '/logout', label: 'Logout' },
      ],
    },
  ];
  const handleMouseEnter = () => toggleSidebar(true);
  const handleMouseLeave = () => toggleSidebar(false);

  return (
    <>
      <div className="fixed top-0 left-0 h-full bg-transparent w-2 z-50" onMouseEnter={handleMouseEnter} />
      <div
        className={`fixed top-0 left-0 h-full bg-gray-500 shadow-lg transition-transform transform ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        } w-52 pt-16 z-50 rounded-lg`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4 flex flex-col justify-between h-full overflow-y-auto bg-gray-500 shadow-lg rounded-md border border-gray-300">
          <div>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id} className="mb-2">
                  {item.submenu ? (
                    <div className="p-2 rounded hover:bg-gray-200">
                      {item.path && (
                        <Link to={item.path} className="block p-2 rounded hover:bg-gray-200">
                          {item.label}
                        </Link>
                      )}
                      <ul className="ml-2 mt-2 bg-gray-500 rounded-lg border border-gray-300">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.id} className="mb-2">
                            <Link to={subitem.path} className="block p-2 rounded hover:bg-red-200">
                              {subitem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Link to={item.path} className="block p-2 rounded hover:bg-red-200">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-gray-500 shadow-lg rounded-md border border-gray-300">
            <img src={caltechLogo2} alt="Caltech Logo 2" className="w-18 h-18 mb-2" />
            <img src={caltechLogo} alt="Caltech Logo" className="w-18 h-18 mb-2" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; */


//version old
/*   import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import caltechLogo from '../../assets/logos/caltech_logo.png';
import caltechLogo2 from '../../assets/logos/caltechlogo2.png';

const Sidebar = ({ isVisible, toggleSidebar }) => {
  const location = useLocation();
  const visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];

  const menuItems = [
    { path: '/', label: 'Welcome' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/reset-password', label: 'Reset Password' },
    {
      path: '/stablehand-welcome',
      label: 'Welcome to Stablehand',
      submenu: [
        { path: '/disclaimer', label: 'Disclaimer' },
        { path: '/demographics', label: 'Demographics' },
        { path: '/medical-interview', label: 'Medical Interview' },
        { path: '/parkinson-interview', label: 'Parkinson Interview' },
        { path: '/therapy', label: 'Therapy' },
        { path: '/progress-notes', label: 'Progress Notes' }
      ]
    },
    { path: '/setting', label: 'Setting' },
    { path: '/account', label: 'Account' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/logout', label: 'Logout' }
  ];

  const handleMouseEnter = () => {
    toggleSidebar(true);
  };

  const handleMouseLeave = () => {
    toggleSidebar(false);
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 h-full bg-transparent w-2 z-50"
        onMouseEnter={handleMouseEnter}
      />
      <div
        className={`fixed top-0 left-0 h-full bg-gray-500 shadow-lg transition-transform transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} w-48 pt-16 z-50`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4 flex flex-col justify-between h-full overflow-y-auto">
          <div>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path || item.label} className={`mb-2 ${visitedPages.includes(item.path) || location.pathname === item.path ? 'text-white' : 'text-gray-400'}`}>
                  {item.submenu ? (
                    <div>
                      <Link to={item.path} className="block p-2 rounded hover:bg-gray-700">{item.label}</Link>
                      <ul className="ml-4 mt-2 bg-gray-700 rounded-lg">
                        {item.submenu.map(subitem => (
                          <li key={subitem.path} className={`mb-2 ${visitedPages.includes(subitem.path) || location.pathname === subitem.path ? 'text-white' : 'text-gray-400'}`}>
                            <Link to={subitem.path} className="block p-2 rounded hover:bg-gray-600">
                              {subitem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Link to={item.path} className="block p-2 rounded hover:bg-gray-700">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-gray-500">
            <img src={caltechLogo2} alt="Caltech Logo 2" className="w-18 h-18 mb-4" />
            <img src={caltechLogo} alt="Caltech Logo" className="w-18 h-18 mb-2" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;  
 */

 
/* 
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import caltechLogo from '../../assets/logos/caltech_logo.png';
import caltechLogo2 from '../../assets/logos/caltechlogo2.png';

const Sidebar = ({ isVisible, toggleSidebar }) => {
  const location = useLocation();
  const visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];

  const menuItems = [
    { path: '/', label: 'Welcome' ,
    submenu: [
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/reset-password', label: 'Reset Password' },
    { path: '/logout', label: 'Logout' }
    ]},
    {
      path: '/stablehand-welcome',
      label: 'Welcome to Stablehand',
      submenu: [
        { path: '/disclaimer', label: 'Disclaimer' },
        { path: '/background', label: 'Background' },
        { path: '/demographics', label: 'Demographics' },
        { path: '/medical-interview', label: 'Medical Interview' },
        { path: '/parkinson-interview', label: 'Parkinson Interview' },
        { path: '/therapy', label: 'Therapy' },
        { path: '/progress-notes', label: 'Progress Notes' }
      ]
    },

   { submenu: [
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/data-deletion-instructions', label: 'Data Deletion' },
     { path: '/terms-of-service', label: 'Terms Of Service' }
    ]},
    
   { submenu: [
    { path: '/setting', label: 'Setting' },
    { path: '/account', label: 'Account' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/logout', label: 'Logout' }
   ]}
  ];

  const handleMouseEnter = () => {
    toggleSidebar(true);
  };

  const handleMouseLeave = () => {
    toggleSidebar(false);
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 h-full bg-transparent w-2 z-50"// make over lay over the header by cahnging the z parameter  -50 higher than -a of footer .
       //className="fixed top-0 left-0 h-full bg-transparent w-4 z-20"
        onMouseEnter={handleMouseEnter}
      />
      <div
        //className={`fixed top-0 left-0 h-full bg-gray-500 shadow-lg transition-transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} w-64 pt-16 rounded-lg flex flex-col justify-between`}
      
  className={`fixed top-0 left-0 h-full bg-gray-500 shadow-lg transition-transform transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} w-52 pt-16 z-50 rounded-lg`} // Adjusted width  and hight and added rounded edges
   onMouseLeave={handleMouseLeave}
      >
         <div // className="p-4 bg-gray-500 shadow-lg rounded-md border border-gray-300 flex-grow  h full overflow-y-auto">
           className="p-4 flex flex-col justify-between h-full overflow-y-auto bg-gray-500 shadow-lg rounded-md border border-gray-300  "> 
        <div>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path || item.label} className={`mb-2 ${visitedPages.includes(item.path) || location.pathname === item.path ? '' : 'text-gray-400'}`}>
                {item.submenu ? (
                  <div className="p-2 rounded hover:bg-gray-200">
                    <Link to={item.path} className="block p-2 rounded hover:bg-gray-200">{item.label}</Link>
                    <ul className="ml-2 mt-2 bg-gray-500 rounded-lg border border-gray-300">
                      {item.submenu.map(subitem => (
                        <li key={subitem.path} className={`mb-2 ${visitedPages.includes(subitem.path) || location.pathname === subitem.path ? '' : 'text-gray-400'}`}>
                          <Link to={subitem.path} className="block p-2 rounded hover:bg-red-200">
                            {subitem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link to={item.path} className="block p-2 rounded hover:bg-red-200">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-gray-500 shadow-lg rounded-md border border-gray-300">
          <img src={caltechLogo2} alt="Caltech Logo 2" className="w-18 h-18 mb-22" />
          <img src={caltechLogo} alt="Caltech Logo" className="w-18 h-18 mb-2" />
        </div>
      </div>
      </div>
    </>
  );
};

export default Sidebar;  
 */
