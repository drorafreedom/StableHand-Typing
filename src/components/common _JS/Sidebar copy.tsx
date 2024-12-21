// src/components/common/Sidebar.jsx


import React, { useState, useEffect } from 'react';
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
        className="fixed top-0 left-0 h-full bg-transparent w-4 z-20"
        onMouseEnter={handleMouseEnter}
      />
      <div
        className={`fixed top-0 left-0 h-full bg-gray-500 shadow-lg transition-transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} w-64 pt-16 rounded-lg`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4 relative bg-gray-500 shadow-lg rounded-md border border-gray-300">
          <ul className="mt-4 space-y-2">
            {menuItems.map((item) => (
              <li key={item.path || item.label} className={`mb-2 ${visitedPages.includes(item.path) || location.pathname === item.path ? '' : 'text-gray-400'}`}>
                {item.submenu ? (
                  <div className="p-2 rounded hover:bg-gray-200">
                    <Link to={item.path} className="block p-2 rounded hover:bg-gray-200">{item.label}</Link>
                    <ul className="ml-4 mt-2 bg-gray-500 rounded-lg border border-gray-300">
                      {item.submenu.map(subitem => (
                        <li key={subitem.path} className={`mb-2 ${visitedPages.includes(subitem.path) || location.pathname === subitem.path ? '' : 'text-gray-400'}`}>
                          <Link to={subitem.path} className="block p-2 rounded hover:bg-gray-200">
                            {subitem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link to={item.path} className="block p-2 rounded hover:bg-gray-200">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;




 // src/components/common/Sidebar.jsx
/* import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isVisible, toggleSidebar }) => {
  const location = useLocation();
  const visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];

  const menuItems = [
    { path: '/', label: 'Welcome' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/reset-password', label: 'Reset Password' },
    { path: '/stablehand-welcome', label: 'Welcome to Stablehand' },
    { path: '/background', label: 'Background' },
    { path: '/demographics', label: 'Demographics' },
    { path: '/medical-interview"', label: 'Medical-Interview"' },
    { path: '/parkinson-interview', label: 'parkinson-interview' },
    { path: '/therapy', label: 'therapy' },
    { path: '/progress-notes', label: 'Progress' },
    { path: '/setting', label: 'Setting' },
    { path: '/account', label: 'Account' },
    { path: '/contact', label: 'ContactUs' },
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
        className="fixed top-0 left-0 h-full bg-transparent w-4 z-20"
        onMouseEnter={handleMouseEnter}
      />
      <div
        className={`fixed top-0 left-0 h-full bg-gray-500 shadow-lg transition-transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} w-64`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4 relative">
          <button onClick={() => toggleSidebar(false)} className="absolute top-2 left-2 text-gray-800 hover:text-gray-600 focus:outline-none mb-4">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <ul className="mt-8">
            {menuItems.map((item) => (
              <li key={item.path} className={`mb-2 ${visitedPages.includes(item.path) || location.pathname === item.path ? '' : 'text-gray-400'}`}>
                <Link to={item.path} className="block p-2 rounded hover:bg-gray-200"> 
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 
 */

/* import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isVisible, toggleSidebar }) => {
  const visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];

  return (
    <div className={`fixed inset-y-0 left-0 transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out bg-gray-800 text-white w-64`}>
      <button className="text-2xl p-2" onClick={toggleSidebar}>✕</button>
      <div className="p-4">
        <Link to="/" className={`block py-2 px-4 rounded ${visitedPages.includes('/') ? 'bg-gray-700' : ''}`}>Welcome</Link>
        <Link to="/login" className={`block py-2 px-4 rounded ${visitedPages.includes('/login') ? 'bg-gray-700' : ''}`}>Login</Link>
        <Link to="/register" className={`block py-2 px-4 rounded ${visitedPages.includes('/register') ? 'bg-gray-700' : ''}`}>Register</Link>
        <Link to="/reset-password" className={`block py-2 px-4 rounded ${visitedPages.includes('/reset-password') ? 'bg-gray-700' : ''}`}>Reset Password</Link>
        <Link to="/stablehand-welcome" className={`block py-2 px-4 rounded ${visitedPages.includes('/stablehand-welcome') ? 'bg-gray-700' : ''}`}>Stablehand Welcome</Link>
        <Link to="/background" className={`block py-2 px-4 rounded ${visitedPages.includes('/background') ? 'bg-gray-700' : ''}`}>Background</Link>
        <Link to="/demographics" className={`block py-2 px-4 rounded ${visitedPages.includes('/demographics') ? 'bg-gray-700' : ''}`}>Demographics</Link>
        <Link to="/medical-interview" className={`block py-2 px-4 rounded ${visitedPages.includes('/medical-interview') ? 'bg-gray-700' : ''}`}>Medical Interview</Link>
        <Link to="/parkinson-interview" className={`block py-2 px-4 rounded ${visitedPages.includes('/parkinson-interview') ? 'bg-gray-700' : ''}`}>Parkinson Interview</Link>
        <Link to="/therapy" className={`block py-2 px-4 rounded ${visitedPages.includes('/therapy') ? 'bg-gray-700' : ''}`}>Therapy</Link>
        <Link to="/logout" className="block py-2 px-4 rounded">Logout</Link>
      </div>
    </div>
  );
};

export default Sidebar; */



/* // src/components/common/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isVisible, toggleSidebar }) => {
  const location = useLocation();
  const visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];

  const menuItems = [
    { path: '/', label: 'Welcome' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/reset-password', label: 'Reset Password' },
    { path: '/stablehand-welcome', label: 'Welcome to Stablehand' },
    { path: '/medical-information', label: 'Medical Information' },
    { path: '/interview', label: 'Interview' },
    { path: '/therapy', label: 'Therapy' },
    { path: '/logout', label: 'Logout' }
  ];

  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    toggleSidebar(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    toggleSidebar(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-half bg-gray-100 shadow-lg transition-transform ${isHovering || isVisible ? 'translate-x-0' : '-translate-x-full'} w-32`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="x-4">
        <button onClick={toggleSidebar} className="text-gray-800 hover:text-gray-600 focus:outline-none mb-4">
          <svg
            className="w-3 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className={`mb-2 ${visitedPages.includes(item.path) || location.pathname === item.path ? '' : 'text-gray-400'}`}>
              <Link to={item.path} className="block p-2 rounded hover:bg-gray-200" onClick={() => setIsHovering(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar; */


/* // src/components/common/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isVisible, toggleSidebar }) => {
  const location = useLocation();
  const visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];

  const menuItems = [
    { path: '/', label: 'Welcome' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/reset-password', label: 'Reset Password' },
    { path: '/stablehand-welcome', label: 'Welcome to Stablehand' },
    { path: '/medical-information', label: 'Medical Information' },
    { path: '/interview', label: 'Interview' },
    { path: '/therapy', label: 'Therapy' },
    { path: '/logout', label: 'Logout' }
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-gray-100 shadow-lg transition-transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} w-64`}>
      <div className="p-4">
        <button onClick={toggleSidebar} className="text-gray-800 hover:text-gray-600 focus:outline-none mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className={`mb-2 ${visitedPages.includes(item.path) || location.pathname === item.path ? '' : 'text-gray-400'}`}>
              <Link to={item.path} className="block p-2 rounded hover:bg-gray-200" onClick={toggleSidebar}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar; */

/* 
// src/components/common/Sidebar.jsx
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isVisible, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Welcome' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/reset', label: 'Reset Password' },
    { path: '/logout', label: 'Logout' },
    { path: '/medical-info', label: 'Medical Information' },
    { path: '/interview', label: 'Interview' },
    { path: '/therapy', label: 'Therapy' }
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.sidebar') && !event.target.closest('.header-button')) {
        toggleSidebar(false);
      }
    };

    if (isVisible) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isVisible, toggleSidebar]);

  return (
    <div className={`sidebar bg-gray-800 text-white fixed top-0 left-0 h-full w-64 z-50 transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
      <ul className="p-4 space-y-2">
        {menuItems.map((item) => (
          <li key={item.path} className={location.pathname === item.path ? 'block' : 'hidden'}>
            <Link to={item.path} onClick={() => toggleSidebar(false)} className="block p-2 hover:bg-gray-700 rounded">{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar; */

/* // src/components/common/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];

  const menuItems = [
    { path: '/', label: 'Welcome' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/reset', label: 'Reset Password' },
    { path: '/stablegait', label: 'Welcome to Stablegait' },
    { path: '/medical-info', label: 'Medical Information' },
    { path: '/interview', label: 'Interview' },
    { path: '/therapy', label: 'Therapy' },
    { path: '/logout', label: 'Logout' },
  ];

  const isPageVisited = (path) => visitedPages.includes(path) || location.pathname === path;

  return (
    <div className={`fixed inset-y-0 left-0 bg-gray-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out`}>
      <button
        className="m-4 p-2 bg-blue-600 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close Menu' : 'Open Menu'}
      </button>
      <div className="p-4">
        <img src={logo} alt="Stable Hand Logo" className="h-10 mb-4" />
        <h1 className="text-xl font-bold mb-8">Stable Hand</h1>
        <nav>
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li key={item.path} className={isPageVisited(item.path) ? '' : 'opacity-50'}>
                <Link to={item.path} onClick={() => setIsOpen(false)}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
 */

/* // src/components/common/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [visitedPages, setVisitedPages] = useState([]);

  useEffect(() => {
    const pages = JSON.parse(localStorage.getItem('visitedPages')) || [];
    setVisitedPages(pages);
  }, [location]);

  const menuItems = [
    { path: '/', label: 'Welcome' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/reset', label: 'Reset Password' },
    { path: '/logout', label: 'Logout' },
    { path: '/medical-info', label: 'Medical Information' },
    { path: '/interview', label: 'Interview' },
    { path: '/therapy', label: 'Therapy' }
  ];

  return (
    <div className="sidebar bg-gray-800 text-white min-h-screen">
      <div className="logo p-4 text-center">
        <h1>Stable Hand</h1>
      </div>
      <ul className="menu p-4">
        {menuItems.map((item) => (
          <li key={item.path} className={visitedPages.includes(item.path) || location.pathname === item.path ? 'visible' : 'hidden'}>
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar; */
