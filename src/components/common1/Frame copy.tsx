// src/components/common/Frame.jsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Frame = ({ children, visitedPages }) => (
  <div className="min-h-screen flex flex-col">
    <Header visitedPages={visitedPages} />
    <main className="flex-grow flex justify-center items-center p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

export default Frame;

/* 

// src/components/common/Frame.jsx
import React from 'react';

const Frame = ({ children }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      maxWidth: '400px',
      margin: '0 auto',
      marginTop: '50px'
    }}>
      {children}
    </div>
  );
};

export default Frame; */
