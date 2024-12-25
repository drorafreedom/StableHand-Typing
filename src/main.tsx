

// src/main.tsx
//+++++++++++TS version+++++++++++++++++
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './App';
import './index.css';
import { AuthProvider } from './data/AuthContext'; // Adjust the path as necessary
import ErrorBoundary from './components/common/ErrorBoundary'; // Adjust the path if necessary

function renderApp() {
  // Explicitly cast to HTMLElement to avoid TypeScript errors
  const rootElement = document.getElementById('root') as HTMLElement;

  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <AppWrapper />
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found');
  }
}

renderApp();

//-----------------------------

//**************explanation
/* Explanation of Key Components:
AuthProvider Outside of App:

Wrapping AppWrapper with AuthProvider in main.jsx ensures that authentication context is accessible globally across your app.
React.StrictMode:

Helps detect potential problems in your application during development (e.g., deprecated lifecycle methods).
createRoot:

Modern React rendering API for concurrent features, replacing ReactDOM.render.
Error Handling for Missing #root:

Adding a check for rootElement is a good practice to avoid runti

Why Use as HTMLElement?
TypeScript requires strict type checking, and document.getElementById can return null if the element is not found. By using as HTMLElement, you explicitly tell TypeScript that the element will exist and is of the correct type.

//+++++++++++JS version+++++++++++++++++
  // src/main.jsx new version 
  // JS version
  

import React from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './App';
import './index.css';
import { AuthProvider } from './data/AuthContext'; // Use the correct path to your single AuthContext
import ErrorBoundary from './components/common/ErrorBoundary'; // If you have an ErrorBoundary component

function renderApp() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <AppWrapper />
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found');
  }
}

renderApp();
//+++++++++++JS version+++++++++++++++++
  // src/main.jsx with autoprovider instead of in app.jsx 
  // JS version
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './App';
import './index.css';
import { AuthProvider } from './data/AuthContext'; // Use the correct path to your single AuthContext

function renderApp() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <AppWrapper />
        </AuthProvider>
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found');
  }
}

renderApp();
me errors if the DOM element is missing. */
//******************************************************* */
/* // src/main.jsx current latest  
import React from 'react';
import { createRoot } from 'react-dom/client';  // Correct import for React 18
import AppWrapper from './App';
import './index.css'; // Global CSS

// Define a function to render the app
function renderApp() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);  // Use createRoot from react-dom/client
    root.render(
      <React.StrictMode>
        <AppWrapper />
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found');
  }
}

// Call the function to render the app
renderApp(); */



// // src/main.jsx or src/index.jsx
// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import AppWrapper from './App';
// import './index.css'; // Ensure you include your global CSS here

// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(<AppWrapper />);




// src\main.jsx
/* import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
} */


// // src/main.jsx or src/index.jsx
// import React from 'react';
// import { createRoot } from 'react-dom/client';

// import AppWrapper from './App';
// import './index.css'; // Ensure you include your global CSS here

// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(<AppWrapper />);




/* // src\main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
 */

