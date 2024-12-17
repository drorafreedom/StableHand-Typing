// src/main.jsx with autoprovider instead of in app.jsx 

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

