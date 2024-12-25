// vite.config.js, 
 import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
 //base: process.env.NODE_ENV === 'production' ? '/my-vite-app/' : './',

  plugins: [react()],
  base: './', // Keep relative paths
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html', // Ensure this points to your index.html file
    },
  },
});


//---------------------------------------------------
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import fs from 'fs';

// const key = fs.readFileSync('./key.pem');
// const cert = fs.readFileSync('./cert.pem');

// export default defineConfig({
//   base: process.env.NODE_ENV === 'production' ? '/my-vite-app/' : '/',
//   plugins: [react()],
//   server: {
//     https: {
//       key,
//       cert
//     },
//     host: true,
//     //port: 5173
//     //port: 5173 // Custom port for local development
//     port: process.env.PORT || 5173, // Use the PORT environment variable or default to 5173
//   },
//   build: {
//     outDir: 'dist',
//     rollupOptions: {
//       input: './index.html'
//     }
//   }
// });



  
/* import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/my-vite-app/' : '/', // GitHub Pages needs subdirectory base, Firebase uses "/"
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html',
    },
  },
});
 */